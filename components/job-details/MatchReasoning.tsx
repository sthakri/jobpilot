import type { Job } from "@/types";

type MatchReasoningProps = {
  job: Job;
};

export function MatchReasoning({ job }: MatchReasoningProps) {
  const matched = job.matched_skills ?? [];
  const missing = job.missing_skills ?? [];

  return (
    <>
      <div className="rounded-2xl border border-border bg-surface p-6 shadow-card">
        <div className="flex items-center gap-2">
  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-success-lightest">
  <svg
    aria-hidden="true"
    className="h-5 w-5 text-success"
    fill="none"
    viewBox="0 0 24 24"
  >
    <path
      d="M12 2L13.09 8.26L20 9.27L13.5 11.5L15.5 18L12 14L8.5 18L10.5 11.5L4 9.27L10.91 8.26L12 2Z"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.5"
    />
  </svg>
</div>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-text-primary">
            AI Match Reasoning
          </h2>
        </div>
        <div className="mt-4">
          <p className="text-sm leading-relaxed text-text-primary">
            {job.match_reason ?? "No match reasoning available."}
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-surface p-6 shadow-card">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-text-primary">
          Required Skills vs Your Profile
        </h2>

        <div className="mt-4">
          <p className="text-sm font-medium text-text-secondary">You have</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {matched.length > 0 ? (
              matched.map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center gap-1 rounded-full bg-success-lightest px-3 py-1 text-xs font-medium text-success-foreground"
                >
                  <svg
                    aria-hidden="true"
                    className="h-3.5 w-3.5"
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
                  {skill}
                </span>
              ))
            ) : (
              <p className="text-sm text-text-muted">No matching skills found.</p>
            )}
          </div>
        </div>

        <div className="mt-4">
          <p className="text-sm font-medium text-text-secondary">Gap skills</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {missing.length > 0 ? (
              missing.map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center gap-1 rounded-full bg-accent-muted px-3 py-1 text-xs font-medium text-accent"
                >
                  <svg
                    aria-hidden="true"
                    className="h-3.5 w-3.5"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M6 6l12 12M18 6l-12 12"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                    />
                  </svg>
                  {skill}
                </span>
              ))
            ) : (
              <p className="text-sm text-text-muted">No gap skills.</p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
