import type { Job } from "@/types";

type JobInfoCardsProps = {
  job: Job;
};

function formatSalary(salary: string | null): string {
  return salary ?? "—";
}

function formatLocation(location: string | null): string {
  return location ?? "—";
}

function formatJobType(type: string | null): string {
  return type ?? "—";
}

function formatDateFound(foundAt: string | null): string {
  if (!foundAt) return "—";
  const date = new Date(foundAt);
  if (isNaN(date.getTime())) return "—";
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  if (diffHours < 1) return "Just now";
  if (diffHours < 24) return diffHours + " hour" + (diffHours > 1 ? "s" : "") + " ago";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return diffDays + " day" + (diffDays > 1 ? "s" : "") + " ago";
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

type InfoCardProps = {
  icon: React.ReactNode;
  value: string;
  label: string;
};

function InfoCard({ icon, value, label }: InfoCardProps) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-6 shadow-card">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface-secondary">
          {icon}
        </div>
        <div>
          <p className="text-sm font-medium text-text-primary">{value}</p>
          <p className="text-xs font-medium uppercase tracking-wider text-text-secondary">{label}</p>
        </div>
      </div>
    </div>
  );
}

export function JobInfoCards({ job }: JobInfoCardsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <InfoCard
        value={formatSalary(job.salary)}
        label="Salary Est."
        icon={
          <svg
            aria-hidden="true"
            className="h-5 w-5 text-text-muted"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.5"
            />
          </svg>
        }
      />
      <InfoCard
        value={formatLocation(job.location)}
        label="Location"
        icon={
          <svg
            aria-hidden="true"
            className="h-5 w-5 text-text-muted"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              d="M12 2a7 7 0 00-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 00-7-7z"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.5"
            />
            <circle
              cx="12"
              cy="9"
              r="2"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.5"
            />
          </svg>
        }
      />
      <InfoCard
        value={formatJobType(job.job_type)}
        label="Job Type"
        icon={
          <svg
            aria-hidden="true"
            className="h-5 w-5 text-text-muted"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              d="M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.5"
            />
            <path
              d="M16 2v5M8 2v5"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.5"
            />
          </svg>
        }
      />
      <InfoCard
        value={formatDateFound(job.found_at)}
        label="Date Found"
        icon={
          <svg
            aria-hidden="true"
            className="h-5 w-5 text-text-muted"
            fill="none"
            viewBox="0 0 24 24"
          >
            <rect
              height="16"
              rx="2"
              ry="2"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.5"
              width="18"
              x="3"
              y="4"
            />
            <path
              d="M16 2v4M8 2v4M3 10h18"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.5"
            />
          </svg>
        }
      />
    </div>
  );
}
