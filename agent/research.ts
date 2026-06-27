import { z } from "zod";
import type { Stagehand } from "@browserbasehq/stagehand";
import { createStagehandSession } from "@/lib/browserbase";
import { nim, parseJsonResponse } from "@/lib/nim-client";
import { captureServerEvent } from "@/lib/posthog-server";
import { createInsforgeServer } from "@/lib/insforge-server";
import type { Profile } from "@/types";

type ResearchDossier = {
  companyOverview: string;
  techStack: string[];
  culture: string[];
  whyThisRole: string;
  yourEdge: string[];
  gapsToAddress: string[];
  smartQuestions: string[];
  interviewPrep: string[];
  sources: string[];
};

type ResearchResult = {
  success: boolean;
  dossier?: ResearchDossier;
  warning?: string;
};

type JobData = {
  title: string;
  company: string;
  description: string;
  matchedSkills: string[];
  missingSkills: string[];
  sourceUrl: string | null;
};

const SUBPAGE_PRIORITY = ["about", "engineering", "blog", "product", "team", "careers"] as const;

const TLD_CANDIDATES = [".com", ".io", ".ai", ".dev", ".co"];

const homepageSchema = z.object({
  oneLiner: z.string().describe("What the company does in one sentence"),
  productSummary: z.string().describe("What they build/sell and who it's for"),
  signals: z.array(z.string()).describe("Funding, notable customers, scale, mission, recent news"),
  pageLinks: z.array(
    z.object({
      url: z.string(),
      kind: z.enum(["about", "careers", "blog", "engineering", "product", "team", "other"]),
    }),
  ).describe("Internal links worth visiting"),
});

const subpageSchema = z.object({
  keyPoints: z.array(z.string()),
  technologies: z.array(z.string()).describe("Specific languages, frameworks, tools, platforms"),
  valuesOrCulture: z.array(z.string()).describe("Stated values, working style, team norms"),
  notable: z.array(z.string()).describe("Customers, funding, scale, projects, awards"),
});

const SYNTHESIS_SYSTEM_PROMPT = `You are a sharp career strategist preparing a candidate to apply for a specific role.
You are given (a) research collected from the company's own website, (b) the job posting,
and (c) the candidate's profile. Produce a concise, concrete briefing that gives this
specific candidate an edge for this specific role.

Rules:
- Ground every company claim in the provided research or job posting. Never invent
  funding, customers, headcount, or facts. If research was thin, infer carefully from
  the job posting and say what's inferred.
- Be specific to THIS candidate. Connect their actual skills and past work to this
  company's stack, product, and values. No generic advice that would apply to anyone.
- Turn the candidate's missing skills into a strategy: how to frame the gap honestly
  and what adjacent experience to lean on.
- Talking points and questions must reference real things from the research, the kind
  of detail that signals the candidate did their homework.
- Keep every item tight: one or two sentences. No fluff.

Return ONLY valid JSON matching this shape:
{
  "companyOverview": string,
  "techStack": string[],
  "culture": string[],
  "whyThisRole": string,
  "yourEdge": string[],
  "gapsToAddress": string[],
  "smartQuestions": string[],
  "interviewPrep": string[],
  "sources": string[]
}`;

function toStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map((v) => String(v));
}

async function logAgentError(
  jobId: string,
  userId: string,
  error: unknown,
): Promise<void> {
  try {
    const client = await createInsforgeServer();
    await client.database.from("agent_logs").insert({
      run_id: null,
      user_id: userId,
      job_id: jobId,
      message: String(error),
      level: "error",
    });
  } catch (logError) {
    console.error("[agent/research] Failed to log agent error:", logError);
  }
}

async function closeStagehand(stagehand: Stagehand | null, jobId: string, userId: string): Promise<void> {
  if (!stagehand) return;
  try {
    await stagehand.close();
  } catch (closeError) {
    console.error("[agent/research] Failed to close Stagehand session:", closeError);
    await logAgentError(jobId, userId, `Stagehand close failed: ${String(closeError)}`);
  }
}

function cleanCompanyName(companyName: string): string {
  return companyName
    .replace(/\s*(Inc\.?|LLC|Ltd\.?|Corp\.?|Co\.?).*$/i, "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

async function deriveCompanyUrl(
  sourceUrl: string | null,
  companyName: string,
): Promise<{ homepageUrl: string; rootDomain: string }> {
  if (sourceUrl) {
    try {
      const response = await fetch(sourceUrl, {
        redirect: "follow",
        signal: AbortSignal.timeout(10000),
      });
      const finalUrl = response.url;
      if (!finalUrl.includes("adzuna.com")) {
        const hostname = new URL(finalUrl).hostname;
        const parts = hostname.split(".");
        const rootDomain = parts.length > 2
          ? parts.slice(-2).join(".")
          : hostname;
        return { homepageUrl: `https://${rootDomain}`, rootDomain };
      }
    } catch {
      // fall through to fallback
    }
  }

  const cleanName = cleanCompanyName(companyName);

  for (const tld of TLD_CANDIDATES) {
    if (tld === ".com") {
      return { homepageUrl: `https://www.${cleanName}.com`, rootDomain: `${cleanName}.com` };
    }
    const candidateDomain = `${cleanName}${tld}`;
    try {
      const probe = await fetch(`https://${candidateDomain}`, {
        method: "HEAD",
        redirect: "follow",
        signal: AbortSignal.timeout(5000),
      });
      if (probe.ok) {
        return { homepageUrl: `https://${candidateDomain}`, rootDomain: candidateDomain };
      }
    } catch {
      continue;
    }
  }

  return { homepageUrl: `https://www.${cleanName}.com`, rootDomain: `${cleanName}.com` };
}

function buildSynthesisUserPrompt(
  companyResearch: Record<string, unknown>,
  job: JobData,
  profile: Profile,
): string {
  const workHistory = profile.work_experience
    .slice(0, 3)
    .map((w) => `${w.jobTitle} at ${w.companyName}`)
    .join("; ");

  return `COMPANY RESEARCH (from their website):
${JSON.stringify(companyResearch)}

JOB POSTING:
Title: ${job.title}
Company: ${job.company}
Description: ${job.description}
Matched skills (already computed): ${job.matchedSkills.join(", ")}
Missing skills (already computed): ${job.missingSkills.join(", ")}

CANDIDATE PROFILE:
Current title: ${profile.current_title}
Experience: ${profile.years_experience} years, level ${profile.experience_level}
Skills: ${profile.skills.join(", ")}
Industries: ${profile.industries.join(", ")}
Work history: ${workHistory || "None listed"}`;
}

function normalizeDossier(raw: Record<string, unknown>, fallbackCompany: string): ResearchDossier {
  return {
    companyOverview: typeof raw.companyOverview === "string" ? raw.companyOverview : `Company: ${fallbackCompany}`,
    techStack: toStringArray(raw.techStack),
    culture: toStringArray(raw.culture),
    whyThisRole: typeof raw.whyThisRole === "string" ? raw.whyThisRole : "",
    yourEdge: toStringArray(raw.yourEdge),
    gapsToAddress: toStringArray(raw.gapsToAddress),
    smartQuestions: toStringArray(raw.smartQuestions),
    interviewPrep: toStringArray(raw.interviewPrep),
    sources: toStringArray(raw.sources),
  };
}

export async function researchCompany(
  userId: string,
  jobId: string,
  job: JobData,
  profile: Profile,
): Promise<ResearchResult> {
  let stagehand: Stagehand | null = null;
  const companyResearch: Record<string, unknown> = {};
  const visitedUrls: string[] = [];

  try {
    const { homepageUrl } = await deriveCompanyUrl(job.sourceUrl, job.company);

    stagehand = await createStagehandSession();
    const page = stagehand.context.activePage() ?? stagehand.context.pages()[0];

    if (!page) {
      throw new Error("No page available from Stagehand session");
    }

    try {
      await page.goto(homepageUrl, { waitUntil: "networkidle", timeoutMs: 30000 });
      visitedUrls.push(homepageUrl);
    } catch (navError) {
      await logAgentError(jobId, userId, `Homepage navigation failed for ${homepageUrl}: ${String(navError)}`);
    }

    if (visitedUrls.length > 0) {
      try {
        const homepageData = await stagehand.extract(
          "This is a company's homepage. Capture what the company actually does, who it's for, and any concrete signals (funding, customers, scale, mission, recent launches). Then find the internal links most worth visiting to research them as an employer.",
          homepageSchema,
        );

        if (!homepageData.oneLiner && !homepageData.productSummary) {
          // Bail to synthesis — wrong site or parked domain
        } else {
          companyResearch.homepage = homepageData;

          const prioritizedLinks = (homepageData.pageLinks ?? [])
            .sort((a, b) => {
              const aIdx = SUBPAGE_PRIORITY.indexOf(a.kind as typeof SUBPAGE_PRIORITY[number]);
              const bIdx = SUBPAGE_PRIORITY.indexOf(b.kind as typeof SUBPAGE_PRIORITY[number]);
              return (aIdx === -1 ? 99 : aIdx) - (bIdx === -1 ? 99 : bIdx);
            })
            .slice(0, 3);

          for (const link of prioritizedLinks) {
            try {
              await page.goto(link.url, { waitUntil: "networkidle", timeoutMs: 20000 });
              visitedUrls.push(link.url);

              const subData = await stagehand.extract(
                "Extract substance that helps a candidate understand this company before applying: what they do, their values and how they work, the specific technologies and tools they use, notable projects or customers, and how the team operates. Ignore nav, footers, cookie banners, and generic marketing copy.",
                subpageSchema,
              );

              companyResearch[link.kind] = subData;
            } catch (subError) {
              await logAgentError(jobId, userId, `Sub-page extraction failed for ${link.url}: ${String(subError)}`);
            }
          }
        }
      } catch (extractError) {
        await logAgentError(jobId, userId, `Homepage extraction failed: ${String(extractError)}`);
      }
    }
  } catch (browserError) {
    await logAgentError(jobId, userId, `Browser research phase failed: ${String(browserError)}`);
  } finally {
    await closeStagehand(stagehand, jobId, userId);
    stagehand = null;
  }

  try {
    const researchContent = Object.keys(companyResearch).length > 0
      ? companyResearch
      : { note: "Browser research unavailable. Inferences based on job posting only." };

    const userPrompt = buildSynthesisUserPrompt(researchContent, job, profile);

    const completion = await nim.chat.completions.create({
      model: "meta/llama-3.2-11b-vision-instruct",
      response_format: { type: "json_object" },
      temperature: 0.4,
      max_tokens: 800,
      messages: [
        { role: "system", content: SYNTHESIS_SYSTEM_PROMPT },
        { role: "user", content: userPrompt },
      ],
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error("Empty response from NIM synthesis");
    }

    const raw = parseJsonResponse(content);
    const dossier = normalizeDossier(raw, job.company);
    dossier.sources = [...new Set([...dossier.sources, ...visitedUrls])];

    const client = await createInsforgeServer();
    await client.database
      .from("jobs")
      .update({ company_research: dossier, researched_at: new Date().toISOString() })
      .eq("id", jobId)
      .eq("user_id", userId);

    await captureServerEvent(userId, "company_researched", {
      userId,
      jobId,
      company: job.company,
    });

    return { success: true, dossier };
  } catch (synthError) {
    await logAgentError(jobId, userId, `NIM synthesis failed: ${String(synthError)}`);

    const fallbackDossier: ResearchDossier = {
      companyOverview: `Company: ${job.company}. Research could not be completed at this time.`,
      techStack: job.missingSkills.slice(0, 5),
      culture: [],
      whyThisRole: `This role at ${job.company} aligns with your background in ${profile.current_title}.`,
      yourEdge: job.matchedSkills.slice(0, 3),
      gapsToAddress: job.missingSkills.slice(0, 3).map((s) => `Prepare to address ${s} gap`),
      smartQuestions: [],
      interviewPrep: [],
      sources: visitedUrls,
    };

    try {
      const client = await createInsforgeServer();
      await client.database
        .from("jobs")
        .update({ company_research: fallbackDossier, researched_at: new Date().toISOString() })
        .eq("id", jobId)
        .eq("user_id", userId);
    } catch (dbError) {
      await logAgentError(jobId, userId, `Failed to save fallback dossier: ${String(dbError)}`);
    }

    return { success: false, dossier: fallbackDossier, warning: "Research partially failed. Showing limited results." };
  }
}
