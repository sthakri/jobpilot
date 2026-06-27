type ProfileCompletionBannerProps = {
  completionPercentage?: number;
  missingFields?: string[];
};

export function ProfileCompletionBanner({
  completionPercentage = 70,
  missingFields = ["PHONE", "LOCATION", "EDUCATION"],
}: ProfileCompletionBannerProps) {
  const showBanner = completionPercentage < 100;

  if (!showBanner) return null;

  return (
    <section className="rounded-2xl border border-border bg-surface p-6 shadow-card md:p-8">
      <div className="flex items-start justify-between gap-6">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-error/10 text-error">
              <svg
                aria-hidden="true"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  d="M12 8v5m0 4h.01"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                />
                <path
                  d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                />
              </svg>
            </span>
            <h2 className="text-base font-semibold text-text-primary">
              Profile needs attention
            </h2>
          </div>

          <p className="max-w-xl text-sm leading-5 text-text-secondary">
            Complete the missing fields to improve your chance of getting
            tailored matches and generating quality resumes.
          </p>

          {missingFields.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {missingFields.map((field) => (
                <span
                  key={field}
                  className="rounded-full bg-error/5 px-3 py-1 text-xs font-medium text-error"
                >
                  {field}
                </span>
              ))}
            </div>
          )}
        </div>

        <div
          className="profile-completion-ring flex-shrink-0"
          role="img"
          aria-label={`Profile completion ${completionPercentage} percent`}
          style={
            {
              "--completion-pct": `${completionPercentage}%`,
            } as React.CSSProperties
          }
        >
          <span className="text-base font-semibold text-text-primary">
            {completionPercentage}%
          </span>
        </div>
      </div>
    </section>
  );
}
