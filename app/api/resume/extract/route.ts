import { NextResponse } from "next/server";
import { createInsforgeServer } from "@/lib/insforge-server";
import { extractProfileFromResume } from "@/agent/extractor";

export async function POST() {
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

    const { data: profile } = await client.database
      .from("profiles")
      .select("resume_key")
      .eq("id", userId)
      .maybeSingle();

    const resumeKey = (profile?.resume_key as string) ?? null;
    if (!resumeKey) {
      return NextResponse.json(
        { success: false, error: "No resume found. Please upload one first." },
        { status: 400 },
      );
    }

    const { data: blob, error: downloadError } = await client.storage
      .from("resumes")
      .download(resumeKey);

    if (downloadError || !blob) {
      return NextResponse.json(
        { success: false, error: "Failed to download resume from storage." },
        { status: 500 },
      );
    }

    const arrayBuffer = await blob.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const result = await extractProfileFromResume(buffer);

    if (!result.success || !result.data) {
      return NextResponse.json(
        { success: false, error: result.error ?? "Extraction failed" },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true, data: result.data });
  } catch (error) {
    console.error("[api/resume/extract]", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}
