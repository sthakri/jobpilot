import Link from "next/link";
import type { Job } from "@/types";

type JobHeaderProps = {
  job: Job;
};

function getMatchScoreBadgeClass(score: number | null): string {
  const s = score ?? 0;
  if (s >= 90) return "bg-success-lightest text-success-foreground";
  if (s >= 70) return "bg-success-light text-success-foreground";
  if (s >= 50) return "bg-warning/10 text-warning";
  return "bg-surface-secondary text-text-muted";
}

export function JobHeader({ job }: JobHeaderProps) {
  const matchScore = job.match_score ?? 0;
  const badgeClass = getMatchScoreBadgeClass(matchScore);
  const externalUrl = job.external_apply_url ?? job.source_url;
  const hasExternalUrl = !!externalUrl;

  return (
    <div className="rounded-2xl border border-border bg-surface p-6 shadow-card">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-border bg-surface-secondary">
            <svg
              aria-hidden="true"
              className="h-6 w-6 text-text-muted"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                d="M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2zM9 20V10h6v10"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
              />
              <path
                d="M9 10V7a3 3 0 016 0v3"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
              />
            </svg>
          </div>
          <div className="space-y-1">
            <h1 className="text-xl font-semibold text-text-primary">
              {job.title ?? "Untitled Role"}
            </h1>
            <div className="flex items-center gap-2">
              <span className="text-sm text-text-secondary">
                {job.company ?? "Unknown Company"}
              </span>
              <span className="text-text-muted">·</span>
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${badgeClass}`}
              >
                {matchScore}% Match Score
              </span>
            </div>
          </div>
        </div>
        {hasExternalUrl && (
          <Link
            href={externalUrl!}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-border bg-surface px-4 py-2 text-sm font-medium text-text-primary transition-colors hover:bg-surface-secondary"
          >
            <svg
              aria-hidden="true"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M21 3l-9 9"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
              />
            </svg>
            View Job Post
          </Link>
        )}
      </div>
    </div>
  );
}
