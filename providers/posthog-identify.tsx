"use client";

import { usePostHog } from "posthog-js/react";
import { useEffect } from "react";

type PostHogIdentifyProps = {
  userId: string;
};

export function PostHogIdentify({ userId }: PostHogIdentifyProps) {
  const posthog = usePostHog();

  useEffect(() => {
    if (userId && posthog) {
      posthog.identify(userId);
    }
  }, [userId, posthog]);

  return null;
}
