import { Stagehand } from "@browserbasehq/stagehand";

export async function createStagehandSession(): Promise<Stagehand> {
  const stagehand = new Stagehand({
    env: "BROWSERBASE",
    apiKey: process.env.BROWSERBASE_API_KEY!,
    projectId: process.env.BROWSERBASE_PROJECT_ID!,
    model: "google/gemini-2.5-flash",
    disablePino: true,
    verbose: 0,
  });

  await stagehand.init();
  return stagehand;
}
