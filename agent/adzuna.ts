import { searchJobs, detectCountry, stripHtml } from "@/lib/adzuna";
import type { AdzunaJob } from "@/lib/adzuna";
import { scoreJob } from "@/agent/matcher";
import { captureServerEvent } from "@/lib/posthog-server";
import { MATCH_THRESHOLD } from "@/lib/utils";
import { createInsforgeServer } from "@/lib/insforge-server";
import { enrichDescription } from "@/lib/job-enrichment";
import type { Profile } from "@/types";

type DiscoverResult = {
  success: boolean;
  jobsFound?: number;
  highMatchCount?: number;
  error?: string;
};

async function logAgentError(
  runId: string,
  userId: string,
  jobId: string | null,
  error: unknown,
): Promise<void> {
  try {
    const client = await createInsforgeServer();
    await client.database.from("agent_logs").insert({
      run_id: runId,
      user_id: userId,
      job_id: jobId,
      message: String(error),
      level: "error",
    });
  } catch (logError) {
    console.error("[agent/adzuna] Failed to log agent error:", logError);
  }
}

export async function discoverJobs(
  userId: string,
  jobTitle: string,
  location: string,
  profile: Profile,
): Promise<DiscoverResult> {
  let runId: string = "";

  try {
    const client = await createInsforgeServer();

    const { data: runData, error: runError } = await client.database
      .from("agent_runs")
      .insert({
        user_id: userId,
        status: "running",
        job_title_searched: jobTitle,
        location_searched: location,
      })
      .select("id")
      .single();

    if (runError || !runData) {
      return { success: false, error: "Failed to create agent run record." };
    }

    runId = String(runData.id);

    await captureServerEvent(userId, "job_search_started", {
      userId,
      jobTitle,
      location,
    });

    const country = location ? detectCountry(location) : "us";
    const adzunaJobs: AdzunaJob[] = await searchJobs(jobTitle, location, country);

    let jobsSaved = 0;
    let highMatchCount = 0;

    for (const job of adzunaJobs) {
      try {
        const scored = await scoreJob(job, profile);

        const rawDescription = stripHtml(job.description);

        const salary = job.salary_min
          ? `$${Math.round(job.salary_min / 1000)}k - $${Math.round((job.salary_max ?? job.salary_min) / 1000)}k`
          : null;

        const companyName = job.company.display_name;
        const locationName = job.location.display_name;

        let aboutRole = rawDescription;
        let responsibilities: string[] | null = null;
        let requirements: string[] | null = null;
        let niceToHave: string[] | null = null;
        let benefits: string[] | null = null;
        let descriptionEnriched = false;

        if (rawDescription.length < 600 || rawDescription.trim().endsWith("…") || rawDescription.trim().endsWith("...")) {
          try {
            const enriched = await enrichDescription(
              rawDescription,
              job.title,
              companyName,
              locationName,
            );
            if (enriched) {
              aboutRole = enriched.about_role;
              responsibilities = enriched.responsibilities.length > 0 ? enriched.responsibilities : null;
              requirements = enriched.requirements.length > 0 ? enriched.requirements : null;
              niceToHave = enriched.nice_to_have.length > 0 ? enriched.nice_to_have : null;
              benefits = enriched.benefits.length > 0 ? enriched.benefits : null;
              descriptionEnriched = true;
            }
          } catch (enrichError) {
            console.error(`[agent/adzuna] Enrichment failed for "${job.title}":`, enrichError);
          }
        }

        const jobRecord = {
          user_id: userId,
          run_id: runId,
          source: "search",
          source_url: job.redirect_url,
          external_apply_url: job.redirect_url,
          title: job.title,
          company: companyName,
          location: locationName,
          salary,
          job_type: job.contract_type || "fulltime",
          about_role: aboutRole,
          responsibilities,
          requirements,
          nice_to_have: niceToHave,
          benefits,
          about_company: null,
          match_score: scored.matchScore,
          match_reason: scored.matchReason,
          matched_skills: scored.matchedSkills,
          missing_skills: scored.missingSkills,
          description_enriched: descriptionEnriched,
          found_at: new Date().toISOString(),
        };

        const { error: insertError } = await client.database
          .from("jobs")
          .insert(jobRecord);

        if (insertError) {
          await logAgentError(runId, userId, null, `Failed to insert job "${job.title}": ${insertError.message}`);
        } else {
          jobsSaved++;
          if (scored.matchScore >= MATCH_THRESHOLD) {
            highMatchCount++;
          }

          await captureServerEvent(userId, "job_found", {
            userId,
            source: "search",
            matchScore: scored.matchScore,
          });
        }
      } catch (scoreError) {
        await logAgentError(runId, userId, null, `Failed to score job "${job.title}": ${String(scoreError)}`);
      }
    }

    await client.database
      .from("agent_runs")
      .update({
        status: "completed",
        jobs_found: jobsSaved,
        completed_at: new Date().toISOString(),
      })
      .eq("id", runId);

    return {
      success: true,
      jobsFound: jobsSaved,
      highMatchCount,
    };
  } catch (error) {
    console.error("[agent/adzuna]", error);

    if (runId) {
      try {
        const client = await createInsforgeServer();
        await client.database
          .from("agent_runs")
          .update({
            status: "failed",
            completed_at: new Date().toISOString(),
          })
          .eq("id", runId);
      } catch (updateError) {
        console.error("[agent/adzuna] Failed to update run status:", updateError);
      }
    }

    return { success: false, error: "Job discovery failed. Please try again." };
  }
}
