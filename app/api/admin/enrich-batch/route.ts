import { NextRequest, NextResponse } from "next/server";
import { enrichDescription } from "@/lib/job-enrichment";

type JobInput = {
  id: string;
  snippet: string;
  title: string;
  company: string;
  location: string;
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const jobs: JobInput[] = body.jobs;

    if (!jobs || !Array.isArray(jobs) || jobs.length === 0) {
      return NextResponse.json(
        { success: false, error: "Missing or empty jobs array" },
        { status: 400 },
      );
    }

    const results = [];

    for (const job of jobs) {
      const enriched = await enrichDescription(job.snippet, job.title, job.company, job.location);
      results.push({
        id: job.id,
        enriched,
        error: enriched ? null : "NIM returned nothing",
      });
    }

    return NextResponse.json({ success: true, data: { results } });
  } catch (err) {
    console.error("[enrich-batch]", err);
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 },
    );
  }
}
