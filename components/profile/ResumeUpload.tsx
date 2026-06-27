"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { insforge } from "@/lib/insforge-client";
import { updateResumeUrl } from "@/actions/resume";
import type { ProfileFormData } from "@/types";

type ResumeUploadProps = {
  userId: string;
  initialResumeUrl?: string | null;
  initialResumeKey?: string | null;
  initialGeneratedUrl?: string | null;
  initialGeneratedKey?: string | null;
  onExtractedData?: (data: Partial<ProfileFormData>) => void;
};

export function ResumeUpload({
  userId,
  initialResumeUrl,
  initialResumeKey,
  initialGeneratedUrl,
  initialGeneratedKey,
  onExtractedData,
}: ResumeUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [resumeUrl, setResumeUrl] = useState<string | null>(
    initialResumeUrl ?? null,
  );
  const [resumeKey, setResumeKey] = useState<string | null>(
    initialResumeKey ?? null,
  );
  const [resumeFileName, setResumeFileName] = useState<string>(
    initialResumeKey ? initialResumeKey.split("/").pop() ?? "resume.pdf" : "resume.pdf",
  );
  const [generatedUrl, setGeneratedUrl] = useState<string | null>(
    initialGeneratedUrl ?? null,
  );
  const [generatedKey, setGeneratedKey] = useState<string | null>(
    initialGeneratedKey ?? null,
  );
  const [uploading, setUploading] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [extractError, setExtractError] = useState<string | null>(null);
  const [generateError, setGenerateError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const cachedBlobUrlRef = useRef<string | null>(null);
  const cachedGeneratedUrlRef = useRef<string | null>(null);

  useEffect(() => {
    return () => {
      if (cachedBlobUrlRef.current) {
        URL.revokeObjectURL(cachedBlobUrlRef.current);
      }
      if (cachedGeneratedUrlRef.current) {
        URL.revokeObjectURL(cachedGeneratedUrlRef.current);
      }
    };
  }, []);

  const handleViewResume = useCallback(async () => {
    if (cachedBlobUrlRef.current) {
      window.open(cachedBlobUrlRef.current, "_blank");
      return;
    }

    if (!resumeKey) return;

    const { data: blob, error: downloadError } = await insforge.storage
      .from("resumes")
      .download(resumeKey);

    if (downloadError || !blob) return;

    const pdfBlob = new Blob([blob], { type: "application/pdf" });
    const url = URL.createObjectURL(pdfBlob);
    cachedBlobUrlRef.current = url;
    window.open(url, "_blank");
  }, [resumeKey]);

  const handleViewGenerated = useCallback(async () => {
    if (cachedGeneratedUrlRef.current) {
      window.open(cachedGeneratedUrlRef.current, "_blank");
      return;
    }

    if (!generatedKey) return;

    const { data: blob, error: downloadError } = await insforge.storage
      .from("resumes")
      .download(generatedKey);

    if (downloadError || !blob) return;

    const pdfBlob = new Blob([blob], { type: "application/pdf" });
    const url = URL.createObjectURL(pdfBlob);
    cachedGeneratedUrlRef.current = url;
    window.open(url, "_blank");
  }, [generatedKey]);

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setError(null);
    setExtractError(null);
    setGenerateError(null);

    if (cachedBlobUrlRef.current) {
      URL.revokeObjectURL(cachedBlobUrlRef.current);
      cachedBlobUrlRef.current = null;
    }

    if (file.type !== "application/pdf") {
      setError("Only PDF files are supported.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("File must be under 5MB.");
      return;
    }

    setUploading(true);
    try {
      if (resumeKey) {
        await insforge.storage.from("resumes").remove(resumeKey);
      }

      const { data, error: uploadError } = await insforge.storage
        .from("resumes")
        .upload(`${userId}/resume.pdf`, file);

      if (uploadError || !data) {
        setError(uploadError?.message ?? "Upload failed.");
        return;
      }

      startTransition(async () => {
        const result = await updateResumeUrl(data.url, data.key);
        if (result.success) {
          setResumeUrl(data.url);
          setResumeKey(data.key);
          setResumeFileName(file.name);
        } else {
          setError(result.error ?? "Failed to save resume URL.");
        }
      });
    } catch {
      setError("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    handleFile(e.dataTransfer.files[0]);
  }

  async function handleGenerate() {
    setGenerating(true);
    setGenerateError(null);
    setError(null);
    setExtractError(null);
    try {
      const res = await fetch("/api/resume/generate", { method: "POST" });
      const json = await res.json();
      if (!json.success) {
        setGenerateError(json.error ?? "Resume generation failed.");
        return;
      }
      const { resumeUrl: newUrl, resumeKey: newKey } = json.data;
      setGeneratedUrl(newUrl);
      setGeneratedKey(newKey);
      if (cachedGeneratedUrlRef.current) {
        URL.revokeObjectURL(cachedGeneratedUrlRef.current);
        cachedGeneratedUrlRef.current = null;
      }
    } catch {
      setGenerateError("Failed to generate resume. Please try again.");
    } finally {
      setGenerating(false);
    }
  }

  async function handleExtract() {
    if (!resumeKey) {
      setExtractError("Upload a resume first before extracting.");
      return;
    }
    setExtracting(true);
    setExtractError(null);
    setError(null);
    setGenerateError(null);
    try {
      const res = await fetch("/api/resume/extract", { method: "POST" });
      const json = await res.json();
      if (!json.success) {
        setExtractError(json.error ?? "Extraction failed.");
        return;
      }
      onExtractedData?.(json.data);
    } catch {
      setExtractError("Failed to extract profile. Please try again.");
    } finally {
      setExtracting(false);
    }
  }

  return (
    <section className="rounded-2xl border border-border bg-surface p-6 shadow-card md:p-8">
      <div className="space-y-5">
        <div>
          <h2 className="text-base font-semibold text-text-primary">Resume</h2>
          <p className="mt-1 text-sm leading-5 text-text-secondary">
            Upload an existing resume to auto-fill the profile, or generate a
            new tailored one from your details below.
          </p>
        </div>

        {resumeUrl ? (
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            className="rounded-2xl border border-dashed border-border bg-surface-secondary p-6 text-center"
          >
            <div className="flex items-center justify-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10 text-accent">
                <svg
                  aria-hidden="true"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"
                    stroke="currentColor"
                    strokeLinejoin="round"
                    strokeWidth="2"
                  />
                  <path
                    d="M14 2v6h6"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                  />
                  <path
                    d="M9 15h6M9 18h6M9 12h3"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                  />
                </svg>
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-text-primary">
                  {resumeFileName}
                </p>
                <button
                  type="button"
                  onClick={handleViewResume}
                  className="text-xs font-medium text-accent transition-colors hover:text-accent-dark"
                >
                  View resume
                </button>
              </div>
            </div>
            <p className="mt-4 text-xs text-text-muted">
              Drag and drop a new file to replace, or click below
            </p>
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={uploading || isPending}
              className="mt-3 rounded-md border border-border bg-surface px-4 py-2 text-sm font-medium text-text-primary transition-colors hover:bg-surface-secondary disabled:cursor-not-allowed disabled:opacity-60"
            >
              {uploading ? "Uploading..." : "Select New Resume"}
            </button>
            {error && (
              <p className="mt-3 text-xs text-error">{error}</p>
            )}
          </div>
        ) : (
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            className="rounded-2xl border border-dashed border-border bg-surface-secondary p-8 text-center"
          >
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-accent/10 text-accent">
              <svg
                aria-hidden="true"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  d="M12 16V4m0 0 4 4m-4-4-4 4"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                />
                <path
                  d="M20 16.5V18a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-1.5"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                />
              </svg>
            </div>
            <p className="text-sm font-medium text-text-primary">
              Click to upload or drag and drop
            </p>
            <p className="mt-1 text-xs leading-5 text-text-muted">
              PDF formatting only. Maximum file size 5MB.
            </p>
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={uploading || isPending}
              className="mt-5 rounded-md border border-border bg-surface px-4 py-2 text-sm font-medium text-text-primary transition-colors hover:bg-surface-secondary disabled:cursor-not-allowed disabled:opacity-60"
            >
              {uploading ? "Uploading..." : "Select Resume"}
            </button>
            {error && (
              <p className="mt-3 text-xs text-error">{error}</p>
            )}
          </div>
        )}

        <input
          ref={inputRef}
          accept="application/pdf"
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0])}
          type="file"
        />

        <div className="flex items-center justify-between gap-4 border-t border-border pt-5">
          <p className="text-sm text-text-secondary">
            Need a fresh document based on the fields below?
          </p>
          <button
            type="button"
            onClick={handleGenerate}
            disabled={generating}
            className="inline-flex items-center gap-2 rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground transition-colors hover:bg-accent-dark disabled:cursor-not-allowed disabled:opacity-60"
          >
            {generating ? (
              <>
                <svg
                  aria-hidden="true"
                  className="h-4 w-4 animate-spin"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    fill="currentColor"
                  />
                </svg>
                Generating...
              </>
            ) : (
              <>
                <svg
                  aria-hidden="true"
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"
                    stroke="currentColor"
                    strokeLinejoin="round"
                    strokeWidth="2"
                  />
                  <path
                    d="M14 2v6h6M9 15h6M9 18h6M9 12h3"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                  />
                </svg>
                Generate Resume from Profile
              </>
            )}
          </button>
        </div>

        {generateError && (
          <p className="text-xs text-error">{generateError}</p>
        )}

        {generatedUrl && (
          <div className="rounded-xl border border-border bg-surface-secondary p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-accent/10 text-accent">
                  <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <path
                      d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"
                      stroke="currentColor"
                      strokeLinejoin="round"
                      strokeWidth="2"
                    />
                    <path
                      d="M14 2v6h6M9 15h6M9 18h6M9 12h3"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-text-primary">
                    Generated Resume
                  </p>
                  <button
                    type="button"
                    onClick={handleViewGenerated}
                    className="text-xs font-medium text-accent transition-colors hover:text-accent-dark"
                  >
                    View generated resume
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {resumeUrl && (
          <div className="flex items-center justify-between gap-4 border-t border-border pt-5">
            <p className="text-sm text-text-secondary">
              Auto-fill profile fields from your uploaded resume?
            </p>
            <button
              type="button"
              onClick={handleExtract}
              disabled={extracting || !resumeKey}
              className="inline-flex items-center gap-2 rounded-md border border-accent bg-surface px-4 py-2 text-sm font-medium text-accent transition-colors hover:bg-accent/5 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {extracting ? (
                <>
                  <svg
                    aria-hidden="true"
                    className="h-4 w-4 animate-spin"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                      fill="currentColor"
                    />
                  </svg>
                  Extracting...
                </>
              ) : (
                <>
                  <svg
                    aria-hidden="true"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2m-6 9 2 2 4-4"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                    />
                  </svg>
                  Extract from Resume
                </>
              )}
            </button>
          </div>
        )}
        {extractError && (
          <p className="text-xs text-error">{extractError}</p>
        )}
      </div>
    </section>
  );
}
