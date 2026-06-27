"use client";

type PaginationProps = {
  start: number;
  end: number;
  total: number;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

export function Pagination({
  start,
  end,
  total,
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps) {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  const visiblePages = pages.filter((p) => {
    if (
      p === 1 ||
      p === totalPages ||
      (p >= currentPage - 1 && p <= currentPage + 1)
    ) {
      return true;
    }
    return false;
  });

  const compactPages: (number | "...")[] = [];
  let lastPage: number | null = null;
  for (const p of visiblePages) {
    if (lastPage !== null && p !== lastPage + 1) {
      compactPages.push("...");
    }
    compactPages.push(p);
    lastPage = p;
  }

  return (
    <div className="flex items-center justify-between">
      <p className="text-sm text-text-muted">
        Showing <span className="font-medium text-text-primary">{start}</span>{" "}
        to <span className="font-medium text-text-primary">{end}</span> of{" "}
        <span className="font-medium text-text-primary">{total}</span> results
      </p>

      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
          className="rounded-lg border border-border bg-surface px-3 py-1.5 text-sm font-medium text-text-secondary transition-colors hover:bg-surface-secondary disabled:cursor-not-allowed disabled:opacity-50"
        >
          Previous
        </button>

        {compactPages.map((p, i) =>
          p === "..." ? (
            <span
              key={`ellipsis-${i}`}
              className="px-2 py-1.5 text-sm text-text-muted"
            >
              ...
            </span>
          ) : (
            <button
              key={p}
              type="button"
              onClick={() => onPageChange(p)}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                p === currentPage
                  ? "bg-accent text-accent-foreground"
                  : "border border-border bg-surface text-text-primary hover:bg-surface-secondary"
              }`}
            >
              {p}
            </button>
          ),
        )}

        <button
          type="button"
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          className="rounded-lg border border-border bg-surface px-3 py-1.5 text-sm font-medium text-text-secondary transition-colors hover:bg-surface-secondary disabled:cursor-not-allowed disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}