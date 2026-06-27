import { Navbar } from "@/components/layout/Navbar";
import { PostHogIdentify } from "@/providers/posthog-identify";
import { createInsforgeServer } from "@/lib/insforge-server";
import { FindJobsClient } from "./FindJobsClient";
import { redirect } from "next/navigation";

export default async function FindJobsPage() {
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

  const { data: jobs, error: jobsError } = await client.database
    .from("jobs")
    .select("*")
    .eq("user_id", userId)
    .order("found_at", { ascending: false });

  if (jobsError) {
    console.error("[find-jobs/page] Failed to fetch jobs:", jobsError);
  }

  return (
    <>
      <Navbar />
      <PostHogIdentify userId={userId} />
      <FindJobsClient jobs={jobs ?? []} />
    </>
  );
}