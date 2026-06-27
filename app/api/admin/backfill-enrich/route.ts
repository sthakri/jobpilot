import { NextResponse } from "next/server";
import { createInsforgeServer } from "@/lib/insforge-server";
import { enrichDescription } from "@/lib/job-enrichment";

export async function POST() {
  try {
    const client = await createInsforgeServer();
    const { data: userData, error: authError } = await client.auth.getCurrentUser();

    if (authError || !userData?.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const userId = userData.user.id;

    const { data: jobs, error: fetchErr } = await client.database
      .from("jobs")
      .select("id, title, about_role, company, location")
      .eq("user_id", userId)
      .eq("description_enriched", false);

    if (fetchErr || !jobs) {
      return NextResponse.json(
        { success: false, error: fetchErr?.message ?? "Fetch failed" },
        { status: 500 },
      );
    }

    let success = 0;
    let failed = 0;

    for (const job of jobs) {
      if (!job.about_role || !job.title || !job.company) {
        failed++;
        continue;
      }

      const enriched = await enrichDescription(
        job.about_role,
        job.title,
        job.company,
        job.location ?? "",
      );

      if (!enriched) {
        failed++;
        continue;
      }

      const { error: updateErr } = await client.database
        .from("jobs")
        .update({
          about_role: enriched.about_role,
          responsibilities: enriched.responsibilities.length > 0 ? enriched.responsibilities : null,
          requirements: enriched.requirements.length > 0 ? enriched.requirements : null,
          nice_to_have: enriched.nice_to_have.length > 0 ? enriched.nice_to_have : null,
          benefits: enriched.benefits.length > 0 ? enriched.benefits : null,
          description_enriched: true,
        })
        .eq("id", job.id);

      if (updateErr) {
        failed++;
      } else {
        success++;
      }
    }

    return NextResponse.json({
      success: true,
      data: { total: jobs.length, enriched: success, failed },
    });
  } catch (err) {
    console.error("[backfill-enrich]", err);
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 },
    );
  }
}
