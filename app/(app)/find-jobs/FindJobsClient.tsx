"use client";

import { useState, useMemo, useTransition } from "react";
import { useRouter } from "next/navigation";
import { JobSearchControls } from "@/components/find-jobs/JobSearchControls";
import { JobFilters } from "@/components/find-jobs/JobFilters";
import { JobsTable } from "@/components/find-jobs/JobsTable";
import { Pagination } from "@/components/find-jobs/Pagination";
import { MATCH_THRESHOLD } from "@/lib/utils";
import type { Job } from "@/types";

const FILTER_OPTIONS = ["All Matches", "High Match", "Low Match"] as const;
const SORT_OPTIONS = ["Match Score", "Newest", "Oldest"] as const;
const JOBS_PER_PAGE = 20;

type FilterOption = (typeof FILTER_OPTIONS)[number];
type SortOption = (typeof SORT_OPTIONS)[number];

type SearchResult = {
  jobsFound: number;
  highMatchCount: number;
};

type FindJobsClientProps = {
  jobs: Job[];
};

export function FindJobsClient({ jobs }: FindJobsClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterValue, setFilterValue] = useState<FilterOption>(FILTER_OPTIONS[0]);
  const [sortValue, setSortValue] = useState<SortOption>(SORT_OPTIONS[0]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchResult, setSearchResult] = useState<SearchResult | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);

  const filteredAndSortedJobs = useMemo(() => {
    let result = jobs;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (job) =>
          job.company?.toLowerCase().includes(query) ||
          job.title?.toLowerCase().includes(query)
      );
    }

    if (filterValue === "High Match") {
      result = result.filter((job) => (job.match_score ?? 0) >= MATCH_THRESHOLD);
    } else if (filterValue === "Low Match") {
      result = result.filter((job) => (job.match_score ?? 0) < MATCH_THRESHOLD);
    }

    if (sortValue === "Match Score") {
      result = [...result].sort((a, b) => (b.match_score ?? 0) - (a.match_score ?? 0));
    } else if (sortValue === "Newest") {
      result = [...result].sort(
        (a, b) => new Date(b.found_at ?? "").getTime() - new Date(a.found_at ?? "").getTime()
      );
    } else if (sortValue === "Oldest") {
      result = [...result].sort(
        (a, b) => new Date(a.found_at ?? "").getTime() - new Date(b.found_at ?? "").getTime()
      );
    }

    return result;
  }, [searchQuery, filterValue, sortValue, jobs]);

  const totalJobs = filteredAndSortedJobs.length;
  const totalPages = Math.ceil(totalJobs / JOBS_PER_PAGE) || 1;
  const startIndex = (currentPage - 1) * JOBS_PER_PAGE;
  const endIndex = Math.min(startIndex + JOBS_PER_PAGE, totalJobs);
  const paginatedJobs = filteredAndSortedJobs.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleFilterChange = (filter: FilterOption) => {
    setFilterValue(filter);
    setCurrentPage(1);
  };

  const handleSortChange = (sort: SortOption) => {
    setSortValue(sort);
    setCurrentPage(1);
  };

  const handleSearchChange = (search: string) => {
    setSearchQuery(search);
    setCurrentPage(1);
  };

  const handleSearch = async (jobTitle: string, location: string) => {
    setSearchError(null);
    setSearchResult(null);

    startTransition(async () => {
      try {
        const response = await fetch("/api/agent/find", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ jobTitle, location }),
        });

        const data = await response.json();

        if (data.success) {
          setSearchResult({
            jobsFound: data.data.jobsFound ?? 0,
            highMatchCount: data.data.highMatchCount ?? 0,
          });
          router.refresh();
        } else {
          setSearchError(data.error ?? "Search failed. Please try again.");
        }
      } catch {
        setSearchError("Something went wrong. Please try again.");
      }
    });
  };

  return (
    <main className="min-h-screen bg-background px-4 py-8 md:px-6 lg:px-8">
      <div className="mx-auto max-w-[1440px] space-y-6">
        <JobSearchControls
          searchResult={searchResult}
          searchError={searchError}
          onSearch={handleSearch}
          isLoading={isPending}
          onDismissError={() => setSearchError(null)}
        />
        <JobFilters
          currentFilter={filterValue}
          currentSort={sortValue}
          currentSearch={searchQuery}
          onFilterChange={handleFilterChange}
          onSortChange={handleSortChange}
          onSearchChange={handleSearchChange}
        />
        <JobsTable jobs={paginatedJobs} />
        <Pagination
          start={totalJobs > 0 ? startIndex + 1 : 0}
          end={endIndex}
          total={totalJobs}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      </div>
    </main>
  );
}
