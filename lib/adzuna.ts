export type AdzunaJob = {
  id: string;
  title: string;
  company: { display_name: string };
  location: { display_name: string };
  description: string;
  redirect_url: string;
  salary_min?: number;
  salary_max?: number;
  salary_is_predicted: "0" | "1";
  contract_type?: string;
  created: string;
  category: { tag: string; label: string };
};

export function stripHtml(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/?(p|div|li|ul|ol|h[1-6])[^>]*>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&/g, "&")
    .replace(/</g, "<")
    .replace(/>/g, ">")
    .replace(/"/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function summarizeDescription(text: string, maxSentences: number = 3): string {
  const plain = stripHtml(text);
  const sentences = plain
    .split(/(?<=[.!?])\s+/)
    .filter((s) => s.trim().length > 10);
  return sentences.slice(0, maxSentences).join(" ").trim();
}

const COUNTRY_KEYWORDS: Record<string, string[]> = {
  gb: ["united kingdom", "uk", "england", "scotland", "wales", "northern ireland", "london", "manchester", "birmingham", "leeds", "bristol", "edinburgh", "liverpool", "glasgow", "sheffield", "cambridge", "oxford", "brighton", "reading", "belfast"],
  au: ["australia", "sydney", "melbourne", "brisbane", "perth", "adelaide", "gold coast", "canberra", "hobart"],
  ca: ["canada", "toronto", "vancouver", "montreal", "calgary", "ottawa", "edmonton", "winnipeg", "halifax", "victoria"],
  de: ["germany", "deutschland", "berlin", "munich", "münchen", "hamburg", "frankfurt", "cologne", "köln", "stuttgart", "düsseldorf"],
  fr: ["france", "paris", "lyon", "marseille", "toulouse", "nice", "bordeaux", "nantes", "strasbourg"],
  nl: ["netherlands", "holland", "amsterdam", "rotterdam", "the hague", "utrecht", "eindhoven"],
  ie: ["ireland", "dublin", "cork", "galway", "limerick", "waterford"],
  at: ["austria", "vienna", "wien", "graz", "linz", "salzburg", "innsbruck"],
  in: ["india", "mumbai", "bangalore", "bengaluru", "delhi", "hyderabad", "chennai", "pune", "kolkata", "noida", "gurgaon", "ahmedabad"],
  sg: ["singapore", "sg"],
};

export function detectCountry(location: string): string {
  const lower = location.toLowerCase().trim();
  for (const [code, keywords] of Object.entries(COUNTRY_KEYWORDS)) {
    for (const keyword of keywords) {
      if (lower.includes(keyword)) {
        return code;
      }
    }
  }
  return "us";
}

export async function searchJobs(
  jobTitle: string,
  location: string,
  country: string = "us",
): Promise<AdzunaJob[]> {
  const params = new URLSearchParams({
    app_id: process.env.ADZUNA_APP_ID!,
    app_key: process.env.ADZUNA_APP_KEY!,
    what: jobTitle,
    category: "it-jobs",
    results_per_page: "10",
    "content-type": "application/json",
  });

  if (location) {
    params.set("where", location);
  }

  const response = await fetch(
    `https://api.adzuna.com/v1/api/jobs/${country}/search/1?${params}`,
  );

  if (!response.ok) {
    throw new Error(`Adzuna API error: ${response.status}`);
  }

  const data = await response.json();
  return data.results || [];
}
