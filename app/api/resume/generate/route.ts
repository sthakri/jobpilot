import { NextResponse } from "next/server";
import React, { type ReactElement } from "react";
import { renderToBuffer, type DocumentProps } from "@react-pdf/renderer";
import { createInsforgeServer } from "@/lib/insforge-server";
import { generateResumeContent } from "@/agent/generator";
import { ResumePDFDocument } from "@/components/resume/ResumePDFDocument";
import type { ResumeContent } from "@/components/resume/ResumePDFDocument";
import type { Profile } from "@/types";

const GENERATED_STORAGE_KEY = "generated";

async function prepareGenerationData() {
  const client = await createInsforgeServer();
  const { data: authData, error: authError } = await client.auth.getCurrentUser();
  if (authError || !authData?.user) {
    return { error: "Unauthorized", status: 401 } as const;
  }

  const userId = authData.user.id;

  const { data: profile, error: profileError } = await client.database
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  if (profileError || !profile) {
    return { error: "Profile not found. Please save your profile first.", status: 400 } as const;
  }

  const generationResult = await generateResumeContent(profile as unknown as Profile);
  if (!generationResult.success || !generationResult.data) {
    return { error: generationResult.error ?? "Resume content generation failed.", status: 500 } as const;
  }

  const resumeContent = generationResult.data;

  const pdfContent: ResumeContent = {
    fullName: profile.full_name ?? "",
    contactLine: resumeContent.contactLine,
    summary: resumeContent.summary,
    workExperience: resumeContent.workExperience,
    education: resumeContent.education,
    skills: resumeContent.skills,
    certifications: resumeContent.certifications,
  };

  const existingGeneratedKey = (profile.generated_resume_key as string) ?? null;

  return { userId, pdfContent, existingGeneratedKey, client } as const;
}

export async function POST() {
  let prepResult: Awaited<ReturnType<typeof prepareGenerationData>>;

  try {
    prepResult = await prepareGenerationData();
  } catch (error) {
    console.error("[api/resume/generate]", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }

  if ("error" in prepResult) {
    return NextResponse.json(
      { success: false, error: prepResult.error },
      { status: prepResult.status },
    );
  }

  const { userId, pdfContent, existingGeneratedKey, client } = prepResult;

  let buffer: Buffer;
  try {
    buffer = await renderToBuffer(
      React.createElement(ResumePDFDocument, { content: pdfContent }) as ReactElement<DocumentProps>,
    );
  } catch (error) {
    console.error("[api/resume/generate] renderToBuffer failed", error);
    return NextResponse.json(
      { success: false, error: "Failed to render resume PDF." },
      { status: 500 },
    );
  }

  try {
    const storageKey = `${userId}/${GENERATED_STORAGE_KEY}/resume.pdf`;

    if (existingGeneratedKey) {
      await client.storage.from("resumes").remove(existingGeneratedKey);
    }

    const pdfBlob = new Blob([new Uint8Array(buffer)], { type: "application/pdf" });
    const { data: uploadData, error: uploadError } = await client.storage
      .from("resumes")
      .upload(storageKey, pdfBlob);

    if (uploadError || !uploadData) {
      return NextResponse.json(
        { success: false, error: "Failed to upload generated resume." },
        { status: 500 },
      );
    }

    const { error: updateError } = await client.database
      .from("profiles")
      .update({
        generated_resume_url: uploadData.url,
        generated_resume_key: uploadData.key,
      })
      .eq("id", userId);

    if (updateError) {
      return NextResponse.json(
        { success: false, error: "Failed to update profile with resume URL." },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        resumeUrl: uploadData.url,
        resumeKey: uploadData.key,
      },
    });
  } catch (error) {
    console.error("[api/resume/generate]", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}
