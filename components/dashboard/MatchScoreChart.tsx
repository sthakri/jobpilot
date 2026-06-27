"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface MatchScoreDataPoint {
  range: string;
  count: number;
}

interface MatchScoreChartProps {
  data: MatchScoreDataPoint[];
}

export function MatchScoreChart({ data }: MatchScoreChartProps) {
  const hasData = data.some((d) => d.count > 0);

  return (
    <div className="rounded-2xl border border-border bg-surface p-6 shadow-card">
      <h3 className="text-base font-semibold text-text-primary">
        Match Score Distribution
      </h3>
      {hasData ? (
      <div className="mt-4 h-[280px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 8, right: 8, left: -16, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="var(--color-border)"
              vertical={false}
            />
            <XAxis
              dataKey="range"
              tick={{ fontSize: 12, fill: "#9CA3AF" }}
              axisLine={false}
              tickLine={false}
              dy={8}
            />
            <YAxis
              tick={{ fontSize: 12, fill: "#9CA3AF" }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                borderRadius: 8,
                border: "1px solid var(--color-border)",
                fontSize: 12,
              }}
              cursor={{
                fill: "var(--color-surface-secondary)",
                opacity: 0.6,
              }}
            />
            <Bar
              dataKey="count"
              fill="#10B981"
              radius={[4, 4, 0, 0]}
              maxBarSize={48}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
      ) : (
        <div className="mt-4 flex h-[280px] items-center justify-center">
          <p className="text-sm text-text-muted">No match scores yet. Find jobs to see your score distribution.</p>
        </div>
      )}
    </div>
  );
}
