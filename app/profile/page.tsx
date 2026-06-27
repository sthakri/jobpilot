import { Navbar } from "@/components/layout/Navbar";
import { ProfileCompletionBanner } from "@/components/profile/ProfileCompletionBanner";
import { ProfileSection } from "@/components/profile/ProfileSection";
import { createInsforgeServer } from "@/lib/insforge-server";
import { PostHogIdentify } from "@/providers/posthog-identify";
import { computeCompletion } from "@/lib/completion";
import { redirect } from "next/navigation";
import type { ProfileFormData, Education } from "@/types";

function mapRowToFormData(row: Record<string, unknown>): ProfileFormData {
  function splitDate(dateStr: string): { month: string; year: string } {
    if (!dateStr) return { month: "", year: "" };
    const parts = (dateStr as string).trim().split(" ");
    if (parts.length >= 2) {
      return { month: parts.slice(0, -1).join(" "), year: parts[parts.length - 1] };
    }
    return { month: "", year: dateStr };
  }

  const rawWorkExp = row.work_experience
    ? (row.work_experience as Record<string, unknown>[])
    : [];
  const workExp = rawWorkExp.map((exp) => {
    const hasNewFormat = "startMonth" in exp;
    const startMonth = hasNewFormat
      ? (exp.startMonth as string) ?? ""
      : splitDate((exp.startDate as string) || "").month;
    const startYear = hasNewFormat
      ? (exp.startYear as string) ?? ""
      : splitDate((exp.startDate as string) || "").year;
    const endMonth = hasNewFormat
      ? (exp.endMonth as string) ?? ""
      : splitDate((exp.endDate as string) || "").month;
    const endYear = hasNewFormat
      ? (exp.endYear as string) ?? ""
      : splitDate((exp.endDate as string) || "").year;
    return {
      companyName: (exp.companyName as string) || "",
      jobTitle: (exp.jobTitle as string) || "",
      startMonth,
      startYear,
      endMonth,
      endYear,
      currentlyWorking: exp.currentlyWorking as boolean,
      responsibilities: (exp.responsibilities as string) || "",
    };
  });
  const edu = row.education ? (row.education as Education) : null;

  return {
    full_name: (row.full_name as string) ?? "",
    email: (row.email as string) ?? "",
    phone: (row.phone as string) ?? "",
    location: (row.location as string) ?? "",
    current_title: (row.current_title as string) ?? "",
    experience_level: (row.experience_level as string) ?? "",
    years_experience: (row.years_experience as number) ?? null,
    skills: (row.skills as string[]) ?? [],
    industries: (row.industries as string[]) ?? [],
    work_experience: workExp,
    education: edu,
    job_titles_seeking: (row.job_titles_seeking as string[]) ?? [],
    remote_preference: (row.remote_preference as string) ?? "",
    preferred_locations: (row.preferred_locations as string[]) ?? [],
    salary_expectation: (row.salary_expectation as string) ?? "",
    linkedin_url: (row.linkedin_url as string) ?? "",
    portfolio_url: (row.portfolio_url as string) ?? "",
    work_authorization: (row.work_authorization as string) ?? "",
    cover_letter_tone: (row.cover_letter_tone as string) ?? "",
  };
}

async function getProfileData(userId: string) {
  const client = await createInsforgeServer();
  const { data: profileRow } = await client.database
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  return {
    formData: profileRow ? mapRowToFormData(profileRow) : null,
    resumeUrl: (profileRow?.resume_pdf_url as string) ?? null,
    resumeKey: (profileRow?.resume_key as string) ?? null,
    generatedUrl: (profileRow?.generated_resume_url as string) ?? null,
    generatedKey: (profileRow?.generated_resume_key as string) ?? null,
  };
}

export default async function ProfilePage() {
  let userId: string;
  let initialData: ProfileFormData | null = null;
  let resumeUrl: string | null = null;
  let resumeKey: string | null = null;
  let generatedUrl: string | null = null;
  let generatedKey: string | null = null;

  try {
    const client = await createInsforgeServer();
    const { data, error } = await client.auth.getCurrentUser();
    if (error || !data?.user) redirect("/login");
    userId = data.user.id;
    const profile = await getProfileData(userId);
    initialData = profile.formData;
    resumeUrl = profile.resumeUrl;
    resumeKey = profile.resumeKey;
    generatedUrl = profile.generatedUrl;
    generatedKey = profile.generatedKey;
  } catch {
    redirect("/login");
  }

  const bannerState = computeCompletion(
    initialData ?? {
      full_name: "",
      email: "",
      phone: "",
      location: "",
      current_title: "",
      experience_level: "",
      years_experience: null,
      skills: [],
      industries: [],
      work_experience: [],
      education: null,
      job_titles_seeking: [],
      remote_preference: "",
      preferred_locations: [],
      salary_expectation: "",
      linkedin_url: "",
      portfolio_url: "",
      work_authorization: "",
      cover_letter_tone: "",
    },
  );

  return (
    <>
      <Navbar />
      <PostHogIdentify userId={userId} />
      <main className="min-h-screen bg-background px-4 py-8 md:px-6 lg:px-8">
        <div className="mx-auto max-w-[960px] space-y-6">
          <ProfileCompletionBanner
            completionPercentage={bannerState.completionPercentage}
            missingFields={bannerState.missingFields}
          />
          <ProfileSection userId={userId} resumeUrl={resumeUrl} resumeKey={resumeKey} generatedUrl={generatedUrl} generatedKey={generatedKey} initialData={initialData} />
        </div>
      </main>
    </>
  );
}
