const POSTHOG_HOST = "https://us.posthog.com";
const POSTHOG_PROJECT_ID = process.env.POSTHOG_PROJECT_ID!;
const POSTHOG_PERSONAL_API_KEY = process.env.POSTHOG_PERSONAL_API_KEY!;

interface HogQLResponse {
  results?: unknown[][];
  columns?: string[];
  types?: string[];
}

interface JobsFoundDataPoint {
  day: string;
  count: number;
}

interface MatchScoreDataPoint {
  range: string;
  count: number;
}

interface ResearchDataPoint {
  day: string;
  count: number;
}

export type { JobsFoundDataPoint, MatchScoreDataPoint, ResearchDataPoint };

async function queryPostHog(hogql: string, name: string): Promise<HogQLResponse> {
  const url = `${POSTHOG_HOST}/api/projects/${POSTHOG_PROJECT_ID}/query/`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${POSTHOG_PERSONAL_API_KEY}`,
    },
    body: JSON.stringify({
      query: { kind: "HogQLQuery", query: hogql },
      name,
    }),
  });

  if (!response.ok) {
    console.error(
      `[posthog-query] API error: ${response.status} ${response.statusText}`
    );
    return {};
  }

  return response.json();
}

export async function getJobsFoundOverTime(
  userId: string,
): Promise<JobsFoundDataPoint[]> {
  try {
    const query = `
      SELECT
        formatDateTime(toStartOfDay(timestamp), '%b %e') AS day,
        count() AS event_count
      FROM events
      WHERE event = 'job_found'
        AND distinct_id = '${userId}'
        AND timestamp >= now() - INTERVAL 30 DAY
      GROUP BY toStartOfDay(timestamp)
      ORDER BY toStartOfDay(timestamp) WITH FILL
        FROM toStartOfDay(now() - INTERVAL 30 DAY)
        TO toStartOfDay(now())
        STEP INTERVAL 1 DAY
      INTERPOLATE (event_count AS 0)
    `;

    const data = await queryPostHog(query, "job_found_daily_last_30_days");

    if (!data.results || !data.columns) return [];

    const dayIdx = data.columns.indexOf("day");
    const countIdx = data.columns.indexOf("event_count");

    if (dayIdx === -1 || countIdx === -1) return [];

    return data.results.map((row) => ({
      day: String(row[dayIdx]),
      count: Number(row[countIdx]),
    }));
  } catch (error) {
    console.error("[posthog-query] getJobsFoundOverTime failed:", error);
    return [];
  }
}

export async function getMatchScoreDistribution(
  userId: string,
): Promise<MatchScoreDataPoint[]> {
  const defaultDistribution: MatchScoreDataPoint[] = [
    { range: "50-60%", count: 0 },
    { range: "60-70%", count: 0 },
    { range: "70-80%", count: 0 },
    { range: "80-90%", count: 0 },
    { range: "90-100%", count: 0 },
  ];

  try {
    const query = `
      SELECT
        multiIf(
          toInt32OrZero(properties.matchScore) >= 90, '90-100%',
          toInt32OrZero(properties.matchScore) >= 80, '80-90%',
          toInt32OrZero(properties.matchScore) >= 70, '70-80%',
          toInt32OrZero(properties.matchScore) >= 60, '60-70%',
          toInt32OrZero(properties.matchScore) >= 50, '50-60%',
          'Below 50%'
        ) AS score_range,
        count() AS event_count
      FROM events
      WHERE event = 'job_found'
        AND distinct_id = '${userId}'
        AND properties.matchScore IS NOT NULL
      GROUP BY score_range
      ORDER BY score_range ASC
    `;

    const data = await queryPostHog(
      query,
      "match_score_distribution_all_time"
    );

    if (!data.results || !data.columns) return defaultDistribution;

    const rangeIdx = data.columns.indexOf("score_range");
    const countIdx = data.columns.indexOf("event_count");

    if (rangeIdx === -1 || countIdx === -1) return defaultDistribution;

    const resultMap = new Map<string, number>();
    for (const row of data.results) {
      const range = String(row[rangeIdx]);
      if (range !== "Below 50%") {
        resultMap.set(range, Number(row[countIdx]));
      }
    }

    return defaultDistribution.map((d) => ({
      ...d,
      count: resultMap.get(d.range) ?? 0,
    }));
  } catch (error) {
    console.error(
      "[posthog-query] getMatchScoreDistribution failed:",
      error
    );
    return defaultDistribution;
  }
}

export async function getCompanyResearchActivity(
  userId: string,
): Promise<ResearchDataPoint[]> {
  try {
    const query = `
      SELECT
        formatDateTime(toStartOfDay(timestamp), '%b %e') AS day,
        count() AS event_count
      FROM events
      WHERE event = 'company_researched'
        AND distinct_id = '${userId}'
        AND timestamp >= now() - INTERVAL 7 DAY
      GROUP BY toStartOfDay(timestamp)
      ORDER BY toStartOfDay(timestamp) WITH FILL
        FROM toStartOfDay(now() - INTERVAL 7 DAY)
        TO toStartOfDay(now())
        STEP INTERVAL 1 DAY
      INTERPOLATE (event_count AS 0)
    `;

    const data = await queryPostHog(
      query,
      "company_researched_daily_last_7_days"
    );

    if (!data.results || !data.columns) return [];

    const dayIdx = data.columns.indexOf("day");
    const countIdx = data.columns.indexOf("event_count");

    if (dayIdx === -1 || countIdx === -1) return [];

    return data.results.map((row) => ({
      day: String(row[dayIdx]),
      count: Number(row[countIdx]),
    }));
  } catch (error) {
    console.error(
      "[posthog-query] getCompanyResearchActivity failed:",
      error
    );
    return [];
  }
}
