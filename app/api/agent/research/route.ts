import { NextRequest, NextResponse } from "next/server";
import { createInsforgeServer } from "@/lib/insforge-server";
import { mapProfileFromDb } from "@/types";
import { researchCompany } from "@/agent/research";

function toStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map((v) => String(v));
}

export async function POST(req: NextRequest) {
  try {
    const client = await createInsforgeServer();
    const { data: authData, error: authError } = await client.auth.getCurrentUser();

    if (authError || !authData?.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const userId = authData.user.id;

    const body = await req.json();
    const jobId = typeof body.jobId === "string" ? body.jobId.trim() : "";

    if (!jobId) {
      return NextResponse.json(
        { success: false, error: "Job ID is required." },
        { status: 400 },
      );
    }

    const { data: jobRow, error: jobError } = await client.database
      .from("jobs")
      .select("*")
      .eq("id", jobId)
      .eq("user_id", userId)
      .maybeSingle();

    if (jobError || !jobRow) {
      return NextResponse.json(
        { success: false, error: "Job not found." },
        { status: 404 },
      );
    }

    const { data: profileRow } = await client.database
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();

    if (!profileRow) {
      return NextResponse.json(
        { success: false, error: "Complete your profile first." },
        { status: 400 },
      );
    }

    const profile = mapProfileFromDb(profileRow as Record<string, unknown>);

    const job = {
      title: String(jobRow.title ?? ""),
      company: String(jobRow.company ?? ""),
      description: String(jobRow.about_role ?? ""),
      matchedSkills: toStringArray(jobRow.matched_skills),
      missingSkills: toStringArray(jobRow.missing_skills),
      sourceUrl: jobRow.source_url ? String(jobRow.source_url) : null,
    };

    const result = await researchCompany(userId, jobId, job, profile);

    if (result.warning) {
      return NextResponse.json({
        success: true,
        data: { dossier: result.dossier },
        warning: result.warning,
      });
    }

    return NextResponse.json({
      success: true,
      data: { dossier: result.dossier },
    });
  } catch (error) {
    console.error("[api/agent/research]", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}
