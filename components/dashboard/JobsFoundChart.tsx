"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface JobsFoundDataPoint {
  day: string;
  count: number;
}

interface JobsFoundChartProps {
  data: JobsFoundDataPoint[];
}

export function JobsFoundChart({ data }: JobsFoundChartProps) {
  const hasData = data.some((d) => d.count > 0);

  return (
    <div className="rounded-2xl border border-border bg-surface p-6 shadow-card">
      <h3 className="text-base font-semibold text-text-primary">
        Jobs Found Over Time
      </h3>
      {hasData ? (
      <div className="mt-4 h-[280px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 8, right: 8, left: -16, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorJobs" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#7C5CFC" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#7C5CFC" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="var(--color-border)"
              vertical={false}
            />
            <XAxis
              dataKey="day"
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
              cursor={{ stroke: "var(--color-border-light)" }}
            />
            <Area
              type="monotone"
              dataKey="count"
              stroke="#7C5CFC"
              strokeWidth={3}
              fill="url(#colorJobs)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      ) : (
        <div className="mt-4 flex h-[280px] items-center justify-center">
          <p className="text-sm text-text-muted">No jobs found yet. Use Find Jobs to discover opportunities.</p>
        </div>
      )}
    </div>
  );
}
