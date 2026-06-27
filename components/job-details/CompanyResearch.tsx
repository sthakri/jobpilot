"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import type { Job } from "@/types";

type CompanyResearchProps = {
  job: Job;
};

type DossierField = {
  key: string;
  label: string;
  type: "paragraph" | "list" | "tags";
};

const DOSSIER_FIELDS: DossierField[] = [
  { key: "companyOverview", label: "Company Overview", type: "paragraph" },
  { key: "techStack", label: "Tech Stack", type: "tags" },
  { key: "culture", label: "Culture", type: "list" },
  { key: "whyThisRole", label: "Why This Role", type: "paragraph" },
  { key: "yourEdge", label: "Your Edge", type: "list" },
  { key: "gapsToAddress", label: "Gaps to Address", type: "list" },
  { key: "smartQuestions", label: "Smart Questions", type: "list" },
  { key: "interviewPrep", label: "Interview Prep", type: "list" },
  { key: "sources", label: "Sources", type: "list" },
];

function renderField(value: unknown, type: "paragraph" | "list" | "tags") {
  if (!value) return null;

  if (type === "paragraph" && typeof value === "string") {
    return <p className="text-sm leading-relaxed text-text-secondary">{value}</p>;
  }

  if (type === "tags" && Array.isArray(value)) {
    return (
      <div className="flex flex-wrap gap-2">
        {value.map((item, i) => (
          <span
            key={i}
            className="inline-flex rounded-full bg-surface-secondary px-3 py-1 text-xs font-medium text-text-primary"
          >
            {String(item)}
          </span>
        ))}
      </div>
    );
  }

  if (type === "list" && Array.isArray(value)) {
    return (
      <ul className="list-disc space-y-1 pl-5">
        {value.map((item, i) => (
          <li key={i} className="text-sm leading-relaxed text-text-secondary">
            {String(item)}
          </li>
        ))}
      </ul>
    );
  }

  return null;
}

export function CompanyResearch({ job }: CompanyResearchProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const inflightRef = useRef(false);
  const router = useRouter();
  const companyName = job.company ?? "the company";
  const dossier = job.company_research as Record<string, unknown> | null;

  const handleResearch = async () => {
    if (inflightRef.current) return;
    inflightRef.current = true;
    setIsLoading(true);
    setError(null);
    setWarning(null);

    try {
      const response = await fetch("/api/agent/research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId: job.id }),
      });

      const data = await response.json();

      if (!data.success) {
        setError(data.error ?? "Research failed. Please try again.");
        return;
      }

      if (data.warning) {
        setWarning(data.warning);
      }

      router.refresh();
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setIsLoading(false);
      inflightRef.current = false;
    }
  };

  if (dossier && Object.keys(dossier).length > 0) {
    return (
      <div className="rounded-2xl border border-border bg-surface p-6 shadow-card">
        <div className="flex items-center gap-2">
          <svg
            aria-hidden="true"
            className="h-5 w-5 text-text-muted"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              d="M3 21h18M5 21V8.5a1 1 0 011-1h3a1 1 0 011 1V21M10 21v-11a1 1 0 011-1h3a1 1 0 011 1v11M15 21v-7.5a1 1 0 011-1h3a1 1 0 011 1V21"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.5"
            />
          </svg>
          <h2 className="text-base font-semibold text-text-primary">Company Research</h2>
        </div>

        <div className="mt-6 space-y-6">
          {DOSSIER_FIELDS.map((field) => {
            const value = dossier[field.key];
            if (!value) return null;
            return (
              <div key={field.key}>
                <h3 className="text-sm font-semibold text-text-primary">{field.label}</h3>
                <div className="mt-2">{renderField(value, field.type)}</div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-surface p-6 shadow-card">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <svg
            aria-hidden="true"
            className="h-5 w-5 text-text-muted"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              d="M3 21h18M5 21V8.5a1 1 0 011-1h3a1 1 0 011 1V21M10 21v-11a1 1 0 011-1h3a1 1 0 011 1v11M15 21v-7.5a1 1 0 011-1h3a1 1 0 011 1V21"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.5"
            />
          </svg>
          <h2 className="text-base font-semibold text-text-primary">Company Research</h2>
        </div>
        <button
          onClick={handleResearch}
          disabled={isLoading}
          className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-accent-foreground transition-colors hover:bg-accent-dark disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isLoading ? (
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
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  fill="currentColor"
                />
              </svg>
              Researching...
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
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                />
              </svg>
              Research Company
            </>
          )}
        </button>
      </div>

      <div className="mt-8 flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border bg-surface-secondary py-12">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-secondary">
          <svg
            aria-hidden="true"
            className="h-6 w-6 text-text-muted"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              d="M3 21h18M5 21V8.5a1 1 0 011-1h3a1 1 0 011 1V21M10 21v-11a1 1 0 011-1h3a1 1 0 011 1v11M15 21v-7.5a1 1 0 011-1h3a1 1 0 011 1V21"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.5"
            />
          </svg>
        </div>
        <p className="text-sm font-medium text-text-secondary">No research yet</p>
        <p className="max-w-md text-center text-xs text-text-muted">
          {`Click \u201CResearch Company\u201D to let the AI browse ${companyName}\u2019s public pages and build a dossier.`}
        </p>
        {warning && (
          <p className="mt-2 max-w-md text-center text-xs text-warning">{warning}</p>
        )}
        {error && (
          <p className="mt-2 max-w-md text-center text-xs text-error">{error}</p>
        )}
      </div>
    </div>
  );
}
