"use server";

import { createAuthActions } from "@insforge/sdk/ssr";
import { cookies } from "next/headers";
import type { OAuthProvidersSchema } from "@insforge/shared-schemas";
import { createCookieAdapter } from "@/lib/cookie-adapter";

type OAuthProvider = "google" | "github";

export async function signInWithOAuth(provider: OAuthProvider) {
  try {
    const cookieStore = await cookies();
    const cookieAdapter = await createCookieAdapter();
    const auth = createAuthActions({ cookies: cookieAdapter });

    const { data, error } = await auth.signInWithOAuth(
      provider as OAuthProvidersSchema,
      {
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback`,
        skipBrowserRedirect: true,
      }
    );

    if (error) {
      return { success: false, error: error.message } as const;
    }

    if (data.url && data.codeVerifier) {
      cookieStore.set("insforge_pkce_verifier", data.codeVerifier, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 10,
        path: "/api/auth/callback",
      });

      return { success: true, url: data.url } as const;
    }

    return { success: false, error: "No OAuth URL returned" } as const;
  } catch (error) {
    console.error("[actions/auth]", error);
    return { success: false, error: "Failed to start sign in" } as const;
  }
}

export async function signOut() {
  try {
    const cookieStore = await cookies();
    const cookieAdapter = await createCookieAdapter();
    const auth = createAuthActions({ cookies: cookieAdapter });

    const { error } = await auth.signOut();
    cookieStore.delete("insforge_pkce_verifier");

    if (error) {
      return { success: false, error: error.message } as const;
    }

    return { success: true } as const;
  } catch (error) {
    console.error("[actions/auth]", error);
    return { success: false, error: "Failed to sign out" } as const;
  }
}
