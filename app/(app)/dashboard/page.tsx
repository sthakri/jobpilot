import { Navbar } from "@/components/layout/Navbar";
import { PostHogIdentify } from "@/providers/posthog-identify";
import { ProfileCompletionBanner } from "@/components/profile/ProfileCompletionBanner";
import { createInsforgeServer } from "@/lib/insforge-server";
import { StatsBar } from "@/components/dashboard/StatsBar";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { CompanyResearchChart } from "@/components/dashboard/CompanyResearchChart";
import { JobsFoundChart } from "@/components/dashboard/JobsFoundChart";
import { MatchScoreChart } from "@/components/dashboard/MatchScoreChart";
import {
  getJobsFoundOverTime,
  getMatchScoreDistribution,
  getCompanyResearchActivity,
} from "@/lib/posthog-query";
import { redirect } from "next/navigation";
import type { ActivityItem } from "@/components/dashboard/RecentActivity";
import type { StatsBarData } from "@/components/dashboard/StatsBar";
import type {
  JobsFoundDataPoint,
  MatchScoreDataPoint,
  ResearchDataPoint,
} from "@/lib/posthog-query";

function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${diffMin} min${diffMin === 1 ? "" : "s"} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? "" : "s"} ago`;
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

interface DashboardData {
  stats: StatsBarData;
  activity: ActivityItem[];
  jobsFoundChart: JobsFoundDataPoint[];
  matchScoreChart: MatchScoreDataPoint[];
  companyResearchChart: ResearchDataPoint[];
}

function computeTrend(current: number, previous: number): string | undefined {
  if (previous === 0) {
    return current > 0 ? "New" : undefined;
  }
  const pct = Math.round(((current - previous) / previous) * 100);
  if (pct > 0) return `+${pct}%`;
  if (pct < 0) return `${pct}%`;
  return undefined;
}

function buildMatchDistributionFromDb(
  scores: (number | null)[],
): MatchScoreDataPoint[] {
  const ranges: MatchScoreDataPoint[] = [
    { range: "50-60%", count: 0 },
    { range: "60-70%", count: 0 },
    { range: "70-80%", count: 0 },
    { range: "80-90%", count: 0 },
    { range: "90-100%", count: 0 },
  ];

  for (const raw of scores) {
    const s = raw ?? 0;
    if (s >= 90) ranges[4].count++;
    else if (s >= 80) ranges[3].count++;
    else if (s >= 70) ranges[2].count++;
    else if (s >= 60) ranges[1].count++;
    else if (s >= 50) ranges[0].count++;
  }

  return ranges;
}

async function getDashboardData(userId: string): Promise<DashboardData> {
  const client = await createInsforgeServer();

  const now = new Date();
  const oneWeekAgo = new Date(now);
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  const twoWeeksAgo = new Date(now);
  twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

  const [
    jobsThisWeekResult,
    jobsPrevWeekResult,
    allJobsCountResult,
    allMatchScoresResult,
    companiesResearchedResult,
    agentRunsResult,
    researchedJobsResult,
  ] = await Promise.all([
    client.database
      .from("jobs")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .gte("found_at", oneWeekAgo.toISOString()),
    client.database
      .from("jobs")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .gte("found_at", twoWeeksAgo.toISOString())
      .lt("found_at", oneWeekAgo.toISOString()),
    client.database
      .from("jobs")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId),
    client.database
      .from("jobs")
      .select("match_score")
      .eq("user_id", userId),
    client.database
      .from("jobs")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .not("company_research", "is", null),
    client.database
      .from("agent_runs")
      .select("job_title_searched, jobs_found, completed_at, status")
      .eq("user_id", userId)
      .eq("status", "completed")
      .order("completed_at", { ascending: false })
      .limit(10),
    client.database
      .from("jobs")
      .select("company, researched_at, found_at")
      .eq("user_id", userId)
      .not("company_research", "is", null)
      .order("researched_at", { ascending: false })
      .limit(10),
  ]);

  if (jobsThisWeekResult.error) console.error("[dashboard] Failed to count this week jobs:", jobsThisWeekResult.error);
  if (jobsPrevWeekResult.error) console.error("[dashboard] Failed to count prev week jobs:", jobsPrevWeekResult.error);
  if (allJobsCountResult.error) console.error("[dashboard] Failed to count jobs:", allJobsCountResult.error);
  if (allMatchScoresResult.error) console.error("[dashboard] Failed to fetch match scores:", allMatchScoresResult.error);
  if (companiesResearchedResult.error) console.error("[dashboard] Failed to count companies:", companiesResearchedResult.error);
  if (agentRunsResult.error) console.error("[dashboard] Failed to fetch agent runs:", agentRunsResult.error);
  if (researchedJobsResult.error) console.error("[dashboard] Failed to fetch researched jobs:", researchedJobsResult.error);

  const totalJobs = allJobsCountResult.count ?? 0;
  const jobsThisWeek = jobsThisWeekResult.count ?? 0;
  const jobsPrevWeek = jobsPrevWeekResult.count ?? 0;
  const totalJobsTrend = computeTrend(jobsThisWeek, jobsPrevWeek);
  const companiesResearched = companiesResearchedResult.count ?? 0;

  let avgMatchRate = 0;
  let avgMatchRateThisWeek = 0;
  let avgMatchRatePrevWeek = 0;
  const allScores = allMatchScoresResult.data ?? [];

  if (allScores.length > 0) {
    const scores = allScores.map((j) => j.match_score ?? 0);
    avgMatchRate = Math.round(scores.reduce((s, v) => s + v, 0) / scores.length);
  }

  if (allScores.length > 0) {
    const [thisWeekMatchData, prevWeekMatchData] = await Promise.all([
      client.database
        .from("jobs")
        .select("match_score")
        .eq("user_id", userId)
        .gte("found_at", oneWeekAgo.toISOString()),
      client.database
        .from("jobs")
        .select("match_score")
        .eq("user_id", userId)
        .gte("found_at", twoWeeksAgo.toISOString())
        .lt("found_at", oneWeekAgo.toISOString()),
    ]);

    if (thisWeekMatchData.data && thisWeekMatchData.data.length > 0) {
      const ws = thisWeekMatchData.data.map((j) => j.match_score ?? 0);
      avgMatchRateThisWeek = Math.round(ws.reduce((s, v) => s + v, 0) / ws.length);
    }
    if (prevWeekMatchData.data && prevWeekMatchData.data.length > 0) {
      const ps = prevWeekMatchData.data.map((j) => j.match_score ?? 0);
      avgMatchRatePrevWeek = Math.round(ps.reduce((s, v) => s + v, 0) / ps.length);
    }
  }

  const avgMatchRateTrend = computeTrend(avgMatchRateThisWeek, avgMatchRatePrevWeek);

  const agentRuns = agentRunsResult.data;
  const researchedJobs = researchedJobsResult.data;

  const activities: ActivityItem[] = [];

  if (agentRuns && agentRuns.length > 0) {
    for (const run of agentRuns) {
      if (run.completed_at && run.job_title_searched) {
        activities.push({
          id: `run-${run.completed_at}-${run.job_title_searched}`,
          text: `Found ${run.jobs_found ?? 0} jobs for ${run.job_title_searched}`,
          timestamp: formatRelativeTime(run.completed_at),
          color: "green",
          createdAt: run.completed_at,
        });
      }
    }
  }

  if (researchedJobs && researchedJobs.length > 0) {
    for (const job of researchedJobs) {
      const ts = job.researched_at ?? job.found_at;
      if (ts && job.company) {
        activities.push({
          id: `research-${ts}-${job.company}`,
          text: `Researched ${job.company}`,
          timestamp: formatRelativeTime(ts),
          color: "purple",
          createdAt: ts,
        });
      }
    }
  }

  const sortedActivity = activities
    .sort((a, b) => new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime())
    .slice(0, 5);

  const [jobsFoundChart, posthogMatchDistribution, companyResearchChart] =
    await Promise.all([
      getJobsFoundOverTime(userId),
      getMatchScoreDistribution(userId),
      getCompanyResearchActivity(userId),
    ]);

  const matchScoreHasPostHogData = posthogMatchDistribution.some((d) => d.count > 0);
  const matchScoreChart = matchScoreHasPostHogData
    ? posthogMatchDistribution
    : buildMatchDistributionFromDb(allScores.map((j) => j.match_score));

  return {
    stats: {
      totalJobs,
      avgMatchRate,
      companiesResearched,
      jobsThisWeek,
      totalJobsTrend,
      avgMatchRateTrend,
    },
    activity: sortedActivity,
    jobsFoundChart,
    matchScoreChart,
    companyResearchChart,
  };
}

async function getProfileCompletion(userId: string) {
  const client = await createInsforgeServer();
  const { data: profileRow } = await client.database
    .from("profiles")
    .select(
      "full_name, phone, location, current_title, experience_level, years_experience, skills, work_experience, education, job_titles_seeking, remote_preference"
    )
    .eq("id", userId)
    .maybeSingle();

  if (!profileRow) return null;

  const missingFields: string[] = [];

  if (!profileRow.full_name) missingFields.push("FULL_NAME");
  if (!profileRow.phone) missingFields.push("PHONE");
  if (!profileRow.location) missingFields.push("LOCATION");
  if (!profileRow.current_title) missingFields.push("CURRENT_TITLE");
  if (!profileRow.experience_level) missingFields.push("EXPERIENCE_LEVEL");
  if (profileRow.years_experience === null || profileRow.years_experience === undefined) missingFields.push("YEARS_EXPERIENCE");
  if (!profileRow.skills || (Array.isArray(profileRow.skills) && profileRow.skills.length === 0)) missingFields.push("SKILLS");
  if (!profileRow.work_experience || (Array.isArray(profileRow.work_experience) && profileRow.work_experience.length === 0)) missingFields.push("WORK_EXPERIENCE");
  if (!profileRow.education) missingFields.push("EDUCATION");
  if (!profileRow.job_titles_seeking || (Array.isArray(profileRow.job_titles_seeking) && profileRow.job_titles_seeking.length === 0)) missingFields.push("JOB_TITLES_SEEKING");
  if (!profileRow.remote_preference) missingFields.push("REMOTE_PREFERENCE");

  const REQUIRED_COUNT = 11;
  const filled = REQUIRED_COUNT - missingFields.length;
  const percentage = Math.round((filled / REQUIRED_COUNT) * 100);

  return {
    completionPercentage: percentage,
    missingFields,
  };
}

export default async function DashboardPage() {
  let userId: string;

  try {
    const client = await createInsforgeServer();
    const { data, error } = await client.auth.getCurrentUser();
    if (error || !data?.user) redirect("/login");
    userId = data.user.id;
  } catch {
    redirect("/login");
  }

  const [dashboardData, bannerState] = await Promise.all([
    getDashboardData(userId),
    getProfileCompletion(userId),
  ]);

  const { stats, activity, jobsFoundChart, matchScoreChart, companyResearchChart } = dashboardData;

  return (
    <>
      <Navbar />
      <PostHogIdentify userId={userId} />
      <main className="min-h-screen bg-background px-4 py-8 md:px-6 lg:px-8">
        <div className="mx-auto max-w-[1440px] space-y-6">
          {bannerState && bannerState.completionPercentage < 100 && (
            <ProfileCompletionBanner
              completionPercentage={bannerState.completionPercentage}
              missingFields={bannerState.missingFields}
            />
          )}
          <StatsBar data={stats} />
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <RecentActivity items={activity} />
            <CompanyResearchChart data={companyResearchChart} />
          </div>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <JobsFoundChart data={jobsFoundChart} />
            <MatchScoreChart data={matchScoreChart} />
          </div>
        </div>
      </main>
    </>
  );
}
