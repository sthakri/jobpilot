import { PostHog } from "posthog-node";

export function createPostHogServer() {
  return new PostHog(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
    host: process.env.NEXT_PUBLIC_POSTHOG_HOST!,
    flushAt: 1,
    flushInterval: 0,
  });
}

export async function captureServerEvent(
  distinctId: string,
  event: string,
  properties?: Record<string, unknown>,
) {
  const posthog = createPostHogServer();
  try {
    posthog.capture({
      distinctId,
      event,
      properties,
    });
    await posthog.shutdown();
  } catch (error) {
    console.error("[posthog-server]", error);
  }
}
