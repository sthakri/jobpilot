import type { Job } from "@/types";

type JobDescriptionProps = {
	job: Job;
};

export function JobDescription({ job }: JobDescriptionProps) {
	const previewText = job.about_role ?? "";
	const isTruncated = previewText.length > 500;
	const displayText = isTruncated ? previewText.slice(0, 500) : previewText;

	return (
		<div className="rounded-2xl border border-border bg-surface p-6 shadow-card">
			<div className="flex items-center gap-2">
				<svg aria-hidden="true" className="h-5 w-5 text-text-muted" fill="none" viewBox="0 0 24 24" >
					<path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
				</svg>
				<h2 className="text-sm font-semibold text-text-primary">Job Description</h2>
			</div>

			<div className="mt-4">
				<p className="text-sm leading-relaxed text-text-secondary whitespace-pre-wrap break-words">
					{displayText}
					{isTruncated ? "..." : ""}
				</p>
			</div>

			{isTruncated && (
				<div className="mt-6 rounded-xl border border-border bg-surface-muted p-4">
					<p className="text-xs text-text-muted">
						This job board provided a preview that ends mid-sentence. Open the original listing to read the full
						description.
					</p>
					{job.source_url && (
						<a
							href={job.source_url}
							target="_blank"
							rel="noopener noreferrer"
							className="mt-3 inline-flex items-center justify-center rounded-lg border border-border bg-surface px-4 py-2 text-sm font-medium text-text-primary transition-colors hover:bg-surface-secondary"
						>
							View Full Job Post
						</a>
					)}
				</div>
			)}
		</div>
	);
}
