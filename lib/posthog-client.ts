import posthog from "posthog-js";

export function captureEvent(
  event: string,
  properties?: Record<string, unknown>,
) {
  posthog.capture(event, properties);
}

export function identifyUser(userId: string) {
  posthog.identify(userId);
}

export function resetUser() {
  posthog.reset();
}
