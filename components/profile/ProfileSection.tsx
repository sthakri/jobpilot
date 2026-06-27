"use client";

import { useState } from "react";
import { ResumeUpload } from "@/components/profile/ResumeUpload";
import { ProfileForm } from "@/components/profile/ProfileForm";
import type { ProfileFormData } from "@/types";

type ProfileSectionProps = {
  userId: string;
  resumeUrl: string | null;
  resumeKey: string | null;
  generatedUrl: string | null;
  generatedKey: string | null;
  initialData: ProfileFormData | null;
};

export function ProfileSection({
  userId,
  resumeUrl,
  resumeKey,
  generatedUrl,
  generatedKey,
  initialData,
}: ProfileSectionProps) {
  const [extractedData, setExtractedData] = useState<Partial<ProfileFormData> | null>(null);

  return (
    <>
      <ResumeUpload
        userId={userId}
        initialResumeUrl={resumeUrl}
        initialResumeKey={resumeKey}
        initialGeneratedUrl={generatedUrl}
        initialGeneratedKey={generatedKey}
        onExtractedData={setExtractedData}
      />
      <ProfileForm initialData={initialData} extractedData={extractedData} />
    </>
  );
}
