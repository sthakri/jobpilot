import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { PostHogIdentify } from "@/providers/posthog-identify";
import { createInsforgeServer } from "@/lib/insforge-server";
import { JobHeader } from "@/components/job-details/JobHeader";
import { JobInfoCards } from "@/components/job-details/JobInfoCards";
import { MatchReasoning } from "@/components/job-details/MatchReasoning";
import { JobDescription } from "@/components/job-details/JobDescription";
import { CompanyResearch } from "@/components/job-details/CompanyResearch";
import { JobActions } from "@/components/job-details/JobActions";
import type { Job } from "@/types";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function JobDetailPage({ params }: Props) {
  const { id } = await params;

  let userId: string;
  let client: Awaited<ReturnType<typeof createInsforgeServer>>;

  try {
    client = await createInsforgeServer();
    const { data, error } = await client.auth.getCurrentUser();
    if (error || !data?.user) redirect("/login");
    userId = data.user.id;
  } catch {
    redirect("/login");
  }

  const { data: jobRow, error: jobError } = await client.database
    .from("jobs")
    .select("*")
    .eq("id", id)
    .eq("user_id", userId)
    .single();

  if (jobError || !jobRow) {
    notFound();
  }

  const job = jobRow as unknown as Job;

  return (
    <>
      <Navbar />
      <PostHogIdentify userId={userId} />
      <main className="min-h-screen bg-background px-4 py-8 md:px-6 lg:px-8">
        <div className="mx-auto max-w-[960px] space-y-6">
          <BackToJobsLink />
          <JobHeader job={job} />
          <JobInfoCards job={job} />
          <MatchReasoning job={job} />
          <JobDescription job={job} />
          <CompanyResearch job={job} />
          <JobActions job={job} />
        </div>
      </main>
    </>
  );
}

function BackToJobsLink() {
  return (
    <Link
      href="/find-jobs"
      className="inline-flex items-center gap-1.5 text-sm font-medium text-text-secondary transition-colors hover:text-accent"
    >
      <svg
        aria-hidden="true"
        className="h-4 w-4"
        fill="none"
        viewBox="0 0 24 24"
      >
        <path
          d="M15 19l-7-7 7-7"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
        />
      </svg>
      Back to Jobs
    </Link>
  );
}
