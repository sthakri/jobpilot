"use client";

import { useTransition } from "react";
import { signOut } from "@/actions/auth";
import { useRouter } from "next/navigation";
import { resetUser } from "@/lib/posthog-client";

export function LogoutButton() {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleSignOut() {
    startTransition(async () => {
      resetUser();
      await signOut();
      router.push("/");
      router.refresh();
    });
  }

  return (
    <button
      onClick={handleSignOut}
      disabled={isPending}
      className="text-sm font-medium text-text-secondary hover:text-text-primary bg-surface border border-border px-4 py-2 rounded-md transition-colors disabled:opacity-50"
    >
      {isPending ? "Signing out..." : "Sign out"}
    </button>
  );
}
