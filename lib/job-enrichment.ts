import { nim, parseJsonResponse } from "@/lib/nim-client";

const ENRICHMENT_PROMPT = `You are a job posting expert. You receive a truncated job description snippet (capped at ~500 chars by the source API) along with the job title, company, and location. Your task is to produce a COMPLETE, realistic job description that the employer likely posted.

Use the snippet as your PRIMARY source of truth. Extract every factual detail from it (skills mentioned, responsibilities listed, location, duration, level, etc.) and expand them into full, properly-structured sections. Use your knowledge of typical job postings for this role and company to fill in reasonable details that are consistent with what the snippet states.

Return ONLY valid JSON with these keys:

- about_role (string — a complete 2-4 paragraph job description. Start with the role overview, then describe what the person will do, and what makes this opportunity compelling. Incorporate ALL specific details from the snippet — duration, experience level, mandatory skills, location/remote info, etc.)
- responsibilities (string[] — 5-8 specific responsibilities for this role, max 8 items)
- requirements (string[] — required qualifications, 5-8 items, max 8 items)
- nice_to_have (string[] — preferred/desired qualifications, 2-5 items, max 5 items)
- benefits (string[] — typical benefits for this type of role, 3-8 items, max 8 items)

Rules:
- Use ALL specific details from the snippet (skills, location, duration, level, etc.)
- Expand truncated sentences naturally based on context and role knowledge
- Remove "…" or "..." truncation markers
- Each responsibility/requirement/nice_to_have/benefit should be one concise sentence
- Be specific to the ROLE — a "Python Backend Engineer" should have very different responsibilities than a "Frontend Developer"
- Return ONLY valid JSON, no markdown fences or extra text

Job details:
`;

export type EnrichedJobFields = {
  about_role: string;
  responsibilities: string[];
  requirements: string[];
  nice_to_have: string[];
  benefits: string[];
};

export async function enrichDescription(
  snippet: string,
  jobTitle: string,
  company: string,
  location: string,
): Promise<EnrichedJobFields | null> {
  try {
    const input = [
      `Title: ${jobTitle}`,
      `Company: ${company}`,
      `Location: ${location}`,
      ``,
      `--- Snippet ---`,
      snippet,
    ].join("\n");

    const completion = await nim.chat.completions.create({
      model: "meta/llama-3.2-11b-vision-instruct",
      response_format: { type: "json_object" },
      temperature: 0.3,
      max_tokens: 2048,
      messages: [
        { role: "user", content: ENRICHMENT_PROMPT + input },
      ],
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) return null;

    const parsed = parseJsonResponse(content);

    const aboutRole = String(parsed.about_role ?? "").trim();
    if (!aboutRole || aboutRole.length < 50) return null;

    return {
      about_role: aboutRole,
      responsibilities: Array.isArray(parsed.responsibilities)
        ? (parsed.responsibilities as string[]).map(String).filter((s) => s.trim().length > 0)
        : [],
      requirements: Array.isArray(parsed.requirements)
        ? (parsed.requirements as string[]).map(String).filter((s) => s.trim().length > 0)
        : [],
      nice_to_have: Array.isArray(parsed.nice_to_have)
        ? (parsed.nice_to_have as string[]).map(String).filter((s) => s.trim().length > 0)
        : [],
      benefits: Array.isArray(parsed.benefits)
        ? (parsed.benefits as string[]).map(String).filter((s) => s.trim().length > 0)
        : [],
    };
  } catch (error) {
    console.error("[job-enrichment] NIM enrichment failed:", error);
    return null;
  }
}
