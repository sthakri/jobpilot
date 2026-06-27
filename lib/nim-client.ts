import OpenAI from "openai";

export const nim = new OpenAI({
  apiKey: process.env.NIM_API_KEY!,
  baseURL: "https://integrate.api.nvidia.com/v1",
});

export function parseJsonResponse(content: string): Record<string, unknown> {
  try {
    const parsed = JSON.parse(content);
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return parsed as Record<string, unknown>;
    }
    return {};
  } catch {
    try {
      const cleaned = content
        .replace(/^```json\s*/i, "")
        .replace(/^```\s*/i, "")
        .replace(/\s*```$/i, "")
        .trim();
      const parsed = JSON.parse(cleaned);
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        return parsed as Record<string, unknown>;
      }
      return {};
    } catch {
      console.error("[nim-client] Failed to parse NIM JSON response");
      return {};
    }
  }
}