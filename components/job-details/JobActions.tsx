import type { Job } from "@/types";

type JobActionsProps = {
  job: Job;
};

export function JobActions({ job }: JobActionsProps) {
  const externalUrl = job.external_apply_url ?? job.source_url;
  const hasUrl = !!externalUrl;

  return (
    <div className="rounded-2xl border border-border bg-surface p-6 shadow-card">
      {hasUrl ? (
        <a
          href={externalUrl!}
          target="_blank"
          rel="noopener noreferrer"
          className="flex w-full items-center justify-center rounded-lg bg-accent px-4 py-3 text-sm font-medium text-accent-foreground transition-colors hover:bg-accent-dark"
        >
          Apply Now at {job.company ?? "Company"}
        </a>
      ) : (
        <button
          disabled
          className="flex w-full items-center justify-center rounded-lg bg-accent px-4 py-3 text-sm font-medium text-accent-foreground opacity-60 cursor-not-allowed"
        >
          Apply Now at {job.company ?? "Company"}
        </button>
      )}
    </div>
  );
}
