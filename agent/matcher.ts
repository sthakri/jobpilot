import { nim, parseJsonResponse } from "@/lib/nim-client";
import type { AdzunaJob } from "@/lib/adzuna";
import type { Profile } from "@/types";
import type { ScoredJob } from "@/agent/types";

const MATCHING_SYSTEM_PROMPT = `You are a job matching assistant. Given a job posting and a candidate's profile, determine how well the candidate matches the job.

Return ONLY valid JSON with exactly these keys:
- matchScore (integer 0-100 — how well the candidate fits this role)
- matchReason (string — one paragraph explaining the score, referencing specific skills and experience)
- matchedSkills (string[] — skills from the candidate's profile that are relevant to this job)
- missingSkills (string[] — skills required by the job that the candidate lacks)

Scoring guidance:
- 90-100: Candidate is an excellent fit — has nearly all required skills and relevant experience
- 80-89: Strong fit — meets most requirements with minor gaps
- 70-79: Good fit — meets core requirements but has notable gaps
- 50-69: Partial fit — some relevant skills but significant gaps
- 0-49: Poor fit — mostly mismatched

Rules:
- Be honest and specific — do not inflate scores
- matchedSkills must be skills the candidate actually has that the job needs
- missingSkills must be skills the job requires that the candidate does not have
- Return ONLY valid JSON, no markdown fences or extra text`;

function buildUserPrompt(job: AdzunaJob, profile: Profile): string {
  const workHistory = profile.work_experience
    .slice(0, 3)
    .map((w) => `${w.jobTitle} at ${w.companyName}`)
    .join("; ");

  return `JOB POSTING:
Title: ${job.title}
Company: ${job.company.display_name}
Location: ${job.location.display_name}
Description: ${job.description}
${job.salary_min ? `Salary range: $${Math.round(job.salary_min / 1000)}k - $${Math.round((job.salary_max ?? job.salary_min) / 1000)}k` : ""}
${job.contract_type ? `Contract type: ${job.contract_type}` : ""}

CANDIDATE PROFILE:
Current title: ${profile.current_title}
Experience: ${profile.years_experience} years, level ${profile.experience_level}
Skills: ${profile.skills.join(", ")}
Industries: ${profile.industries.join(", ")}
Target roles: ${profile.job_titles_seeking.join(", ")}
Work history: ${workHistory || "None listed"}`;
}

export async function scoreJob(
  job: AdzunaJob,
  profile: Profile,
): Promise<ScoredJob> {
  const completion = await nim.chat.completions.create({
    model: "meta/llama-3.2-11b-vision-instruct",
    response_format: { type: "json_object" },
    temperature: 0.3,
    max_tokens: 300,
    messages: [
      { role: "system", content: MATCHING_SYSTEM_PROMPT },
      { role: "user", content: buildUserPrompt(job, profile) },
    ],
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) {
    throw new Error("No response from NIM for job scoring");
  }

  const parsed = parseJsonResponse(content);

  const matchScore = typeof parsed.matchScore === "number"
    ? Math.min(100, Math.max(0, Math.round(parsed.matchScore)))
    : 50;

  return {
    matchScore,
    matchReason: String(parsed.matchReason ?? ""),
    matchedSkills: Array.isArray(parsed.matchedSkills)
      ? (parsed.matchedSkills as string[]).map(String)
      : [],
    missingSkills: Array.isArray(parsed.missingSkills)
      ? (parsed.missingSkills as string[]).map(String)
      : [],
  };
}
