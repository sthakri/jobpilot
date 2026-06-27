"use client";

export interface ActivityItem {
  id: string;
  text: string;
  timestamp: string;
  color: "green" | "blue" | "purple";
  createdAt?: string;
}

interface RecentActivityProps {
  items: ActivityItem[];
}

function ActivityDot({ color }: { color: ActivityItem["color"] }) {
  const outerColor =
    color === "green"
      ? "bg-success-light"
      : color === "blue"
      ? "bg-info-light"
      : "bg-accent-light";
  const innerColor =
    color === "green"
      ? "bg-success-alt"
      : color === "blue"
      ? "bg-info"
      : "bg-accent";

  return (
    <div
      className={`flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full ${outerColor} ring-4 ring-white`}
    >
      <div className={`h-2 w-2 rounded-full ${innerColor}`} />
    </div>
  );
}

export function RecentActivity({ items }: RecentActivityProps) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-6 shadow-card">
      <h3 className="text-base font-semibold text-text-primary">
        Recent Activity
      </h3>
      {items.length > 0 ? (
      <div className="mt-4 space-y-6">
        {items.map((item) => (
          <div key={item.id} className="flex gap-3">
            <div className="pt-0.5">
              <ActivityDot color={item.color} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-text-primary">
                {item.text}
              </p>
              <p className="mt-0.5 text-xs leading-4 text-text-muted">
                {item.timestamp}
              </p>
            </div>
          </div>
        ))}
      </div>
      ) : (
        <div className="mt-4 flex h-[200px] items-center justify-center">
          <p className="text-sm text-text-muted">No activity yet. Search for jobs or research a company to get started.</p>
        </div>
      )}
    </div>
  );
}
