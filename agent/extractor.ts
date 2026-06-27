import { PDFParse } from "pdf-parse";
import { nim, parseJsonResponse } from "@/lib/nim-client";
import type { ProfileFormData, WorkExperience, Education } from "@/types";
import * as pdfjsWorker from "pdfjs-dist/legacy/build/pdf.worker.mjs";

(globalThis as Record<string, unknown>).pdfjsWorker = pdfjsWorker;

function normalizeUrl(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (/^[\w-]+\.[\w.-]+/i.test(trimmed)) return `https://${trimmed}`;
  return trimmed;
}

const PROJECT_KEYWORDS = [
  "project",
  "portfolio",
  "personal project",
  "side project",
  "open-source",
  "open source",
  "hackathon",
  "volunteer",
  "freelance project",
  "self-employed project",
  "academic project",
  "capstone",
  "thesis project",
];

function isLikelyProject(entry: Record<string, unknown>): boolean {
  const company = String(entry.companyName ?? "").toLowerCase();
  const title = String(entry.jobTitle ?? "").toLowerCase();
  const combo = `${company} ${title}`;
  return PROJECT_KEYWORDS.some((kw) => combo.includes(kw));
}

const INDUSTRY_KEYWORDS: Record<string, string[]> = {
  "Software / Technology": ["react", "javascript", "typescript", "python", "node", "aws", "cloud", "saas", "api", "backend", "frontend", "fullstack", "devops", "kubernetes", "docker", "microservices", "software"],
  "Finance / FinTech": ["finance", "fintech", "bank", "trading", "payment", "crypto", "blockchain", "ledger", "portfolio", "investment"],
  "Healthcare / Biotech": ["health", "medical", "pharma", "clinical", "biotech", "hospital", "diagnostics", "genomics"],
  "E-Commerce / Retail": ["ecommerce", "e-commerce", "retail", "marketplace", "shop", "store", "inventory", "catalog"],
  "Education / EdTech": ["education", "edtech", "learning", "course", "student", "lms", "tutor", "academy"],
  "Media / Entertainment": ["media", "streaming", "video", "audio", "gaming", "entertainment", "content", "broadcast"],
  "Consulting / Professional Services": ["consulting", "advisory", "audit", "professional services", "big four"],
};

function inferredIndustries(skills: string[], workExp: WorkExperience[]): string[] {
  const haystack = [
    ...skills.map((s) => s.toLowerCase()),
    ...workExp.map((w) => `${w.companyName} ${w.jobTitle} ${w.responsibilities}`.toLowerCase()),
  ].join(" ");

  const matches: string[] = [];
  for (const [industry, keywords] of Object.entries(INDUSTRY_KEYWORDS)) {
    if (keywords.some((kw) => haystack.includes(kw))) {
      matches.push(industry);
    }
  }
  return matches.length > 0 ? matches : ["Technology"];
}

const EXTRACTION_PROMPT = `You are a resume parser. Extract the following fields from the resume text below and return them as a JSON object with exactly these keys:

- full_name (string)
- email (string)
- phone (string)
- location (string)
- current_title (string - most recent or current job title)
- experience_level (string - one of: Junior, Mid, Senior, Lead)
- years_experience (number - total years of professional work experience)
- skills (string[] - all technical and soft skills mentioned)
- industries (string[] - industries the person has worked in, infer from companies and roles)
- work_experience (array of objects, each with: companyName, jobTitle, startMonth, startYear, endMonth, endYear, currentlyWorking, responsibilities)
- education (object with: highestDegree, fieldOfStudy, institutionName, graduationYear, or null if none)
- linkedin_url (string - the full LinkedIn profile URL like https://linkedin.com/in/username. Empty string if not found)
- portfolio_url (string - the full GitHub profile URL like https://github.com/username, or personal website URL. Empty string if not found)
- job_titles_seeking (string[] - 3-5 most suitable job titles for this person based on their experience, skills, and career trajectory. These should be specific roles like "Senior Frontend Engineer" or "Product Manager", not generic categories)
- remote_preference (string - one of: Remote, Hybrid, Onsite, Any. Infer from resume signals: mentions of remote work → "Remote", mentions of hybrid/office → "Hybrid" or "Onsite", no signal → "Any")
- industries (string[] - industries the person has worked in, infer from companies and roles)

Rules:
- Return ONLY valid JSON, no markdown fences or extra text
- Use full month names (January, February, etc.) for startMonth/endMonth
- If a field is not found in the resume, use an empty string "" for strings, empty array [] for arrays, or null for education
- Combine all responsibilities/duties into a single string per role
- Infer experience_level from years of experience: 0-2=Junior, 3-5=Mid, 6-9=Senior, 10+=Lead

CRITICAL — Work experience vs Education vs Projects vs Certifications:
- work_experience: ONLY include paid employment (jobs, internships, co-ops with companies or organizations). NEVER include side projects, open-source contributions, personal projects, freelance work done outside a company, hackathon entries, or academic research unless it was a paid position at a university.
- education: ONLY formal degrees (Bachelor's, Master's, PhD, Associate, Diploma) with an institution name. Include the degree name, field of study, school/university name, and graduation year. If only a certification (e.g., AWS, PMP, Google cert) is listed without a degree, set education to null.
- Skills list: Include ALL technical skills (languages, frameworks, tools), soft skills, and domain expertise mentioned anywhere in the resume. Do NOT put skills inside work_experience descriptions.
- Certifications and courses that are not formal degrees go into skills, NOT into education or work_experience.
- Side projects, personal projects, volunteer work, and open-source contributions: DO NOT include in work_experience. Instead, fold relevant technologies from these into the skills array.

CRITICAL — URL mapping (do not swap):
- github.com URLs always go to portfolio_url
- linkedin.com URLs always go to linkedin_url
- Personal website URLs always go to portfolio_url
- Never put a GitHub URL in linkedin_url
- Never put a LinkedIn URL in portfolio_url

CRITICAL — Do not fabricate data:
- Only extract information that is explicitly present in the resume text below
- Do NOT invent skills, job titles, companies, dates, or URLs that are not in the resume
- Do NOT use default values or common examples
- For work_experience dates, only use dates explicitly mentioned for that specific role
- Do not guess or infer dates from other entries or from common knowledge

CRITICAL — Job titles seeking auto-fill:
- If the resume explicitly mentions target roles or desired positions, use those for job_titles_seeking
- If NO target roles are mentioned, infer 3-5 specific, high-demand job titles that best match the person's skills and experience
- Base these on the person's actual tech stack, domain expertise, and career level — not generic suggestions
- Examples: A React/TypeScript developer with 3 years → "Frontend Engineer", "React Developer", "UI Engineer", "Web Developer", "Software Engineer"
- Make these realistic roles a recruiter would actually list, tailored to THIS person's capabilities

CRITICAL — URL format (must include protocol):
- github.com URLs must be returned as full URLs: "https://github.com/username"
- linkedin.com URLs must be returned as full URLs: "https://linkedin.com/in/username" or "https://www.linkedin.com/in/username"
- Personal website URLs must include https://
- Never return a URL without the https:// protocol prefix

Resume text:
`;

export async function extractProfileFromResume(
  resumeBuffer: Buffer,
): Promise<{ success: boolean; data?: Partial<ProfileFormData>; error?: string }> {
  try {
    const parser = new PDFParse({ data: resumeBuffer });
    const textResult = await parser.getText();
    await parser.destroy();

    if (!textResult.text || textResult.text.trim().length < 50) {
      return {
        success: false,
        error:
          "Could not extract text from this PDF. Please try a different file.",
      };
    }

    const completion = await nim.chat.completions.create({
      model: "meta/llama-3.2-11b-vision-instruct",
      messages: [
        {
          role: "user",
          content: EXTRACTION_PROMPT + textResult.text,
        },
      ],
      temperature: 0.1,
      max_tokens: 4096,
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      return { success: false, error: "No response from AI model." };
    }

    const parsed = parseJsonResponse(content) as Record<string, unknown>;

    const rawWorkExperience: WorkExperience[] = Array.isArray(
      parsed.work_experience,
    )
      ? (parsed.work_experience as Record<string, unknown>[]).map((exp) => ({
          companyName: String(exp.companyName ?? ""),
          jobTitle: String(exp.jobTitle ?? ""),
          startMonth: String(exp.startMonth ?? ""),
          startYear: String(exp.startYear ?? ""),
          endMonth: String(exp.endMonth ?? ""),
          endYear: String(exp.endYear ?? ""),
          currentlyWorking: Boolean(exp.currentlyWorking),
          responsibilities: String(exp.responsibilities ?? ""),
        }))
      : [];

    const projectTechnologies: string[] = [];
    const filteredWorkExperience: WorkExperience[] = [];

    for (const entry of rawWorkExperience) {
      if (isLikelyProject(entry as unknown as Record<string, unknown>)) {
        const resp = entry.responsibilities.toLowerCase();
        const techMatches = resp.match(
          /\b(?:react|vue|angular|node|python|java|typescript|javascript|go|rust|c\+\+|ruby|swift|kotlin|django|flask|spring|express|next|tailwind|docker|kubernetes|aws|gcp|azure|firebase|postgresql|mongodb|redis|graphql|rest|tensorflow|pytorch|git|figma|sass)\b/gi,
        );
        if (techMatches) {
          for (const tech of techMatches) {
            const capitalized = tech.charAt(0).toUpperCase() + tech.slice(1);
            if (!projectTechnologies.includes(capitalized)) {
              projectTechnologies.push(capitalized);
            }
          }
        }
      } else {
        filteredWorkExperience.push(entry);
      }
    }

    const existingSkills = Array.isArray(parsed.skills)
      ? (parsed.skills as string[])
      : [];
    const mergedSkills = [...existingSkills];
    for (const tech of projectTechnologies) {
      if (!mergedSkills.some((s) => s.toLowerCase() === tech.toLowerCase())) {
        mergedSkills.push(tech);
      }
    }

    const education: Education | null =
      parsed.education &&
      typeof parsed.education === "object" &&
      (parsed.education as Record<string, unknown>).highestDegree
        ? {
            highestDegree: String(
              (parsed.education as Record<string, unknown>).highestDegree ?? "",
            ),
            fieldOfStudy: String(
              (parsed.education as Record<string, unknown>).fieldOfStudy ?? "",
            ),
            institutionName: String(
              (parsed.education as Record<string, unknown>).institutionName ??
                "",
            ),
            graduationYear: String(
              (parsed.education as Record<string, unknown>).graduationYear ?? "",
            ),
          }
        : null;

    const data: Partial<ProfileFormData> = {
      full_name: String(parsed.full_name ?? ""),
      email: String(parsed.email ?? ""),
      phone: String(parsed.phone ?? ""),
      location: String(parsed.location ?? ""),
      current_title: String(parsed.current_title ?? ""),
      experience_level: String(parsed.experience_level ?? ""),
      years_experience: typeof parsed.years_experience === "number"
        ? parsed.years_experience
        : null,
      skills: mergedSkills,
      industries: Array.isArray(parsed.industries)
        ? (parsed.industries as string[]).length > 0
          ? (parsed.industries as string[])
          : inferredIndustries(mergedSkills, filteredWorkExperience)
        : inferredIndustries(mergedSkills, filteredWorkExperience),
      work_experience: filteredWorkExperience,
      education,
      linkedin_url: normalizeUrl(String(parsed.linkedin_url ?? "")),
      portfolio_url: normalizeUrl(String(parsed.portfolio_url ?? "")),
      job_titles_seeking: Array.isArray(parsed.job_titles_seeking)
        ? (parsed.job_titles_seeking as string[]).filter(
            (t) => typeof t === "string" && t.trim().length > 0,
          )
        : [],
      remote_preference: ["Remote", "Hybrid", "Onsite", "Any"].includes(
        String(parsed.remote_preference ?? ""),
      )
        ? String(parsed.remote_preference)
        : "Any",
    };

    return { success: true, data };
  } catch (error) {
    console.error("[agent/extractor]", error);
    return { success: false, error: "Failed to extract profile from resume." };
  }
}
