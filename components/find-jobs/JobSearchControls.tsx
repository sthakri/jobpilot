"use client";

import { useState, FormEvent } from "react";

type SearchResult = {
  jobsFound: number;
  highMatchCount: number;
};

type JobSearchControlsProps = {
  searchResult: SearchResult | null;
  searchError: string | null;
  onSearch: (jobTitle: string, location: string) => void;
  onDismissError: () => void;
  isLoading?: boolean;
};

export function JobSearchControls({
  searchResult,
  searchError,
  onSearch,
  onDismissError,
  isLoading = false,
}: JobSearchControlsProps) {
  const [jobTitle, setJobTitle] = useState("");
  const [location, setLocation] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmedTitle = jobTitle.trim();
    if (!trimmedTitle) return;
    onSearch(trimmedTitle, location.trim());
  };

  return (
    <div className="rounded-2xl border border-border bg-surface p-6 shadow-card">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 md:flex-row md:items-end md:gap-6">
        <div className="flex-1 space-y-2">
          <label
            htmlFor="job-title"
            className="text-xs font-medium uppercase tracking-wider text-text-secondary"
          >
            Job Title
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <svg
                aria-hidden="true"
                className="h-4 w-4 text-text-muted"
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
            </div>
            <input
              id="job-title"
              type="text"
              placeholder="Frontend Engineer"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              className="w-full rounded-lg border border-border bg-surface px-4 py-2.5 pl-10 text-sm font-medium text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </div>
        </div>

        <div className="flex-1 space-y-2">
          <label
            htmlFor="location"
            className="text-xs font-medium uppercase tracking-wider text-text-secondary"
          >
            Location
          </label>
          <input
            id="location"
            type="text"
            placeholder="Remote, New York..."
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-sm font-medium text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-accent px-6 py-2.5 text-sm font-medium text-accent-foreground hover:bg-accent-dark disabled:cursor-not-allowed disabled:opacity-50"
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
                  d="M12 2a10 10 0 0110 10"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeWidth="4"
                />
              </svg>
              Searching...
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
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                />
              </svg>
              Find Jobs
            </>
          )}
        </button>
      </form>

      {searchError && (
        <div className="mt-4 rounded-lg bg-error/5 border border-error/20 p-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <svg
                aria-hidden="true"
                className="h-4 w-4 text-error"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                />
              </svg>
              <span className="text-sm font-medium text-error">{searchError}</span>
            </div>
            <button
              type="button"
              onClick={onDismissError}
              className="text-text-muted hover:text-text-primary"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24">
                <path
                  d="M6 18L18 6M6 6l12 12"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                />
              </svg>
            </button>
          </div>
        </div>
      )}

      {searchResult && searchResult.jobsFound > 0 && (
        <div className="mt-4 rounded-lg bg-success/10 p-3">
          <div className="flex items-center gap-2">
            <svg
              aria-hidden="true"
              className="h-4 w-4 text-success"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                d="M5 13l4 4L19 7"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
              />
            </svg>
            <span className="text-sm font-medium text-success-dark">
              Found {searchResult.jobsFound} jobs and saved {searchResult.highMatchCount} strong matches.
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
