"use client";

const FILTER_OPTIONS = ["All Matches", "High Match", "Low Match"] as const;
const SORT_OPTIONS = ["Match Score", "Newest", "Oldest"] as const;

type FilterOption = (typeof FILTER_OPTIONS)[number];
type SortOption = (typeof SORT_OPTIONS)[number];

type JobFiltersProps = {
  onFilterChange: (filter: FilterOption) => void;
  onSortChange: (sort: SortOption) => void;
  onSearchChange: (search: string) => void;
  currentFilter: FilterOption;
  currentSort: SortOption;
  currentSearch: string;
};

export function JobFilters({
  onFilterChange,
  onSortChange,
  onSearchChange,
  currentFilter,
  currentSort,
  currentSearch,
}: JobFiltersProps) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-border bg-surface px-4 py-3 shadow-card">
      <div className="relative flex-1">
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
          type="text"
          placeholder="Filter by company or role..."
          value={currentSearch}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full rounded-lg border border-transparent bg-transparent py-2 pl-10 pr-4 text-sm font-medium text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
        />
      </div>

      <div className="flex items-center gap-3">
        <select
          value={currentFilter}
          onChange={(e) => onFilterChange(e.target.value as FilterOption)}
          className="rounded-lg border border-border bg-surface px-3 py-2 text-sm font-medium text-text-primary appearance-none pr-8 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke-width='1.5' stroke='%236A7282'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M19.5 8.25l-7.5 7.5-7.5-7.5' /%3E%3C/svg%3E")`,
            backgroundRepeat: "no-repeat",
            backgroundPosition: "right 0.5rem center",
            backgroundSize: "1rem",
          }}
        >
          {FILTER_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>

        <select
          value={currentSort}
          onChange={(e) => onSortChange(e.target.value as SortOption)}
          className="rounded-lg border border-border bg-surface px-3 py-2 text-sm font-medium text-text-primary appearance-none pr-8 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke-width='1.5' stroke='%236A7282'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M19.5 8.25l-7.5 7.5-7.5-7.5' /%3E%3C/svg%3E")`,
            backgroundRepeat: "no-repeat",
            backgroundPosition: "right 0.5rem center",
            backgroundSize: "1rem",
          }}
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}