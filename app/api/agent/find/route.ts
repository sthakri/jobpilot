import { NextRequest, NextResponse } from "next/server";
import { createInsforgeServer } from "@/lib/insforge-server";
import { discoverJobs } from "@/agent/adzuna";
import { mapProfileFromDb } from "@/types";

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
    const jobTitle = typeof body.jobTitle === "string" ? body.jobTitle.trim() : "";
    const location = typeof body.location === "string" ? body.location.trim() : "";

    if (!jobTitle) {
      return NextResponse.json(
        { success: false, error: "Job title is required." },
        { status: 400 },
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

    const result = await discoverJobs(userId, jobTitle, location, profile);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error ?? "Job discovery failed." },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        jobsFound: result.jobsFound ?? 0,
        highMatchCount: result.highMatchCount ?? 0,
      },
    });
  } catch (error) {
    console.error("[api/agent/find]", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}
