"use client";

interface StatCardProps {
  label: string;
  value: string | number;
  subtitle: string;
  trend?: string;
}

function StatCard({ label, value, subtitle, trend }: StatCardProps) {
  const isNegative = trend?.startsWith("-");
  return (
    <div className="rounded-2xl border border-border bg-surface p-6 shadow-card">
      <div className="text-sm font-medium text-text-secondary">{label}</div>
      <div className="mt-1 text-[30px] font-semibold leading-[36px] text-text-primary">
        {value}
      </div>
      <div className="mt-1 flex items-center gap-2">
        {trend && (
          <span className={`rounded-sm px-2 py-0.5 text-xs font-medium ${isNegative ? "bg-warning-lightest text-warning-darker" : "bg-success-lightest text-success-darker"}`}>
            {trend}
          </span>
        )}
        <span className="text-xs leading-4 text-text-muted">{subtitle}</span>
      </div>
    </div>
  );
}

export interface StatsBarData {
  totalJobs: number;
  avgMatchRate: number;
  companiesResearched: number;
  jobsThisWeek: number;
  totalJobsTrend?: string;
  avgMatchRateTrend?: string;
}

interface StatsBarProps {
  data: StatsBarData;
}

export function StatsBar({ data }: StatsBarProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        label="Total Jobs Found"
        value={data.totalJobs}
        subtitle="vs last week"
        trend={data.totalJobsTrend}
      />
      <StatCard
        label="Avg. Match Rate"
        value={`${data.avgMatchRate}%`}
        subtitle="vs last week"
        trend={data.avgMatchRateTrend}
      />
      <StatCard
        label="Companies Researched"
        value={data.companiesResearched}
        subtitle="Total researched"
      />
      <StatCard
        label="Jobs This Week"
        value={data.jobsThisWeek}
        subtitle="New this week"
      />
    </div>
  );
}
