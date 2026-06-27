"use client";

import Link from "next/link";
import type { Job } from "@/types";

type MatchScoreColorScheme = {
  barColor: string;
  textColor: string;
  bgColor: string;
};

function getMatchScoreColors(score: number): MatchScoreColorScheme {
  if (score >= 90) {
    return { barColor: "bg-success", textColor: "text-success", bgColor: "bg-success-lightest" };
  }
  if (score >= 70) {
    return { barColor: "bg-success", textColor: "text-success", bgColor: "bg-success-light" };
  }
  if (score >= 50) {
    return { barColor: "bg-warning", textColor: "text-warning", bgColor: "" };
  }
  return { barColor: "bg-text-muted", textColor: "text-text-muted", bgColor: "" };
}

function MatchScoreBar({ score }: { score: number | null }) {
  const displayScore = score ?? 0;
  const { barColor, textColor } = getMatchScoreColors(displayScore);
  return (
    <div className="flex items-center gap-3">
      <div className="h-1.5 w-16 rounded-full bg-border-light">
        <div
          className={`h-1.5 rounded-full ${barColor}`}
          style={{ width: `${displayScore}%` }}
        />
      </div>
      <span className={`text-sm font-medium ${textColor}`}>{displayScore}%</span>
    </div>
  );
}

function CompanyCell({ company }: { company: string | null }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-surface-secondary">
        <svg
          aria-hidden="true"
          className="h-5 w-5 text-text-secondary"
          fill="none"
          viewBox="0 0 24 24"
        >
          <path
            d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
          />
        </svg>
      </div>
      <span className="text-sm font-medium text-text-primary">{company ?? "Unknown Company"}</span>
    </div>
  );
}

function SourceBadge({ source }: { source: string | null }) {
  if (source === "search") {
    return (
      <span className="inline-flex rounded-full bg-surface-secondary px-2 py-0.5 text-xs font-medium text-text-secondary">
        Search
      </span>
    );
  }
  return (
    <span className="inline-flex rounded-full bg-surface-secondary px-2 py-0.5 text-xs font-medium text-text-secondary">
      URL
    </span>
  );
}

function formatFoundAt(dateString: string | null): string {
  if (!dateString) return "—";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "—";
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  if (diffHours < 1) return "Just now";
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

type JobsTableProps = {
  jobs: Job[];
};

export function JobsTable({ jobs }: JobsTableProps) {
  return (
    <div className="rounded-2xl border border-border bg-surface shadow-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-text-secondary">
                Company
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-text-secondary">
                Role
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-text-secondary">
                Match Score
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-text-secondary">
                Salary Est.
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-text-secondary">
                Source
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-text-secondary">
                Date Found
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {jobs.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center gap-2 text-text-muted">
                    <svg
                      aria-hidden="true"
                      className="h-8 w-8"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <path
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                      />
                    </svg>
                    <p className="text-sm font-medium">No jobs found</p>
                    <p className="text-xs">Try adjusting your search criteria</p>
                  </div>
                </td>
              </tr>
            ) : (
              jobs.map((job) => (
                <tr
                  key={job.id}
                  className="transition-colors hover:bg-surface-secondary"
                >
                  <td className="px-6 py-4">
                    <Link href={`/find-jobs/${job.id}`} className="block">
                      <CompanyCell company={job.company} />
                    </Link>
                  </td>
                  <td className="px-6 py-4">
                    <Link
                      href={`/find-jobs/${job.id}`}
                      className="block text-sm font-medium text-text-primary hover:text-accent"
                    >
                      {job.title ?? "Untitled Role"}
                    </Link>
                  </td>
                  <td className="px-6 py-4">
                    <Link href={`/find-jobs/${job.id}`} className="block">
                      <MatchScoreBar score={job.match_score} />
                    </Link>
                  </td>
                  <td className="px-6 py-4">
                    <Link
                      href={`/find-jobs/${job.id}`}
                      className="block text-sm text-text-primary"
                    >
                      {job.salary ?? "—"}
                    </Link>
                  </td>
                  <td className="px-6 py-4">
                    <SourceBadge source={job.source} />
                  </td>
                  <td className="px-6 py-4">
                    <Link
                      href={`/find-jobs/${job.id}`}
                      className="block text-sm text-text-secondary"
                    >
                      {formatFoundAt(job.found_at)}
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
