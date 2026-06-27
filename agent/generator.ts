import { nim, parseJsonResponse } from "@/lib/nim-client";
import type { Profile } from "@/types";

type GeneratedResumeContent = {
  summary: string;
  workExperience: {
    companyName: string;
    jobTitle: string;
    startDate: string;
    endDate: string;
    bullets: string[];
  }[];
  education: {
    degree: string;
    institution: string;
    year: string;
  } | null;
  skills: string[];
  contactLine: string;
  certifications: string[];
};

const GENERATION_PROMPT = `You are a professional resume writer. Given a candidate's profile data, produce polished resume content suitable for a one-page PDF resume.

Return ONLY valid JSON with exactly these keys:
- summary (string — 2-3 sentence professional summary highlighting the candidate's strengths and career focus. Write in first person without using "I". E.g. "Experienced frontend engineer with 6+ years...")
- workExperience (array of objects, each with: companyName, jobTitle, startDate like "Jan 2022", endDate like "Present" or "Mar 2024", bullets — array of 2-4 achievement-oriented bullet points starting with action verbs, quantifying impact where possible)
- education (object with degree like "B.S. Computer Science", institution, year — or null if no education)
- skills (string[] — top 8-12 most relevant technical skills, combined from the profile skills list)
- contactLine (string — formatted as "city | phone | email | linkedin-url-or-portfolio-url" — use the profile data, omit any field that is empty, separate with " | ")
- certifications (string[] — any certifications mentioned in the profile. Empty array if none)

Rules:
- Polished, professional language throughout — no raw data dumps
- Work experience bullets must start with strong action verbs and describe impact, not just duties
- Summary should be concise and compelling — 2-3 sentences maximum
- Limit workExperience to the 3 most recent roles
- Limit skills to the 12 most relevant ones for the candidate's target roles
- If work_experience entries have no separate responsibilities string, infer reasonable bullets from the job title and company
- Use the complete profile data — include remote_preference, work_authorization, and job_titles_seeking context to inform the summary and skill selection
- Do NOT invent any facts, companies, skills, or dates not present in the profile data
- Do NOT wrap the JSON in markdown fences

Profile data:
`;

export async function generateResumeContent(
  profile: Profile,
): Promise<{ success: boolean; data?: GeneratedResumeContent; error?: string }> {
  try {
    const profileSnippet = {
      full_name: profile.full_name,
      email: profile.email,
      phone: profile.phone,
      location: profile.location,
      current_title: profile.current_title,
      experience_level: profile.experience_level,
      years_experience: profile.years_experience,
      skills: profile.skills,
      industries: profile.industries,
      work_experience: profile.work_experience,
      education: profile.education,
      job_titles_seeking: profile.job_titles_seeking,
      linkedin_url: profile.linkedin_url,
      portfolio_url: profile.portfolio_url,
      remote_preference: profile.remote_preference,
      work_authorization: profile.work_authorization,
      preferred_locations: profile.preferred_locations,
      salary_expectation: profile.salary_expectation,
    };

    const completion = await nim.chat.completions.create({
      model: "meta/llama-3.2-11b-vision-instruct",
      messages: [
        {
          role: "user",
          content: GENERATION_PROMPT + JSON.stringify(profileSnippet, null, 2),
        },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      return { success: false, error: "No response from AI model." };
    }

    const parsed = parseJsonResponse(content) as Record<string, unknown>;

    const workExperience: GeneratedResumeContent["workExperience"] = Array.isArray(
      parsed.workExperience,
    )
      ? (parsed.workExperience as Record<string, unknown>[]).map((exp) => ({
          companyName: String(exp.companyName ?? ""),
          jobTitle: String(exp.jobTitle ?? ""),
          startDate: String(exp.startDate ?? ""),
          endDate: String(exp.endDate ?? ""),
          bullets: Array.isArray(exp.bullets)
            ? (exp.bullets as string[]).map((b) => String(b))
            : [],
        }))
      : [];

    const education: GeneratedResumeContent["education"] =
      parsed.education &&
      typeof parsed.education === "object" &&
      (parsed.education as Record<string, unknown>).degree
        ? {
            degree: String((parsed.education as Record<string, unknown>).degree ?? ""),
            institution: String(
              (parsed.education as Record<string, unknown>).institution ?? "",
            ),
            year: String((parsed.education as Record<string, unknown>).year ?? ""),
          }
        : null;

    const data: GeneratedResumeContent = {
      summary: String(parsed.summary ?? ""),
      workExperience,
      education,
      skills: Array.isArray(parsed.skills) ? (parsed.skills as string[]) : [],
      contactLine: String(parsed.contactLine ?? ""),
      certifications: Array.isArray(parsed.certifications) ? (parsed.certifications as string[]) : [],
    };

    return { success: true, data };
  } catch (error) {
    console.error("[agent/generator]", error);
    return { success: false, error: "Failed to generate resume content." };
  }
}
