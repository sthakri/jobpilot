import { createAuthActions } from "@insforge/sdk/ssr";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createPostHogServer } from "@/lib/posthog-server";
import { rateLimit } from "@/lib/rate-limiter";

function wrapRequestCookies(request: NextRequest) {
  return {
    get: (name: string) => request.cookies.get(name)?.value ?? null,
  };
}

function wrapResponseCookies(response: NextResponse) {
  return {
    get: (name: string) => response.cookies.get(name)?.value ?? null,
    set: (...args: unknown[]) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (response.cookies.set as any)(...args);
    },
    delete: (...args: unknown[]) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (response.cookies.delete as any)(...args);
    },
  };
}

export async function GET(request: NextRequest) {
  const rateLimitResponse = rateLimit(request, { limit: 10, windowMs: 15 * 60 * 1000, keyPrefix: "auth:callback" });
  if (rateLimitResponse) return rateLimitResponse;

  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("insforge_code");
  const errorParam = searchParams.get("error");

  if (errorParam) {
    return NextResponse.redirect(new URL("/login?error=oauth_failed", request.url));
  }

  if (!code) {
    return NextResponse.redirect(new URL("/login?error=no_code", request.url));
  }

  const codeVerifier = request.cookies.get("insforge_pkce_verifier")?.value;

  if (!codeVerifier) {
    return NextResponse.redirect(new URL("/login?error=no_verifier", request.url));
  }

  const response = NextResponse.redirect(new URL("/profile", request.url));

  const requestCookies = wrapRequestCookies(request);
  const responseCookies = wrapResponseCookies(response);

  const auth = createAuthActions({
    requestCookies,
    responseCookies,
  });

  const { error } = await auth.exchangeOAuthCode(code, codeVerifier);

  responseCookies.delete("insforge_pkce_verifier");

  if (error) {
    return NextResponse.redirect(new URL("/login?error=exchange_failed", request.url));
  }

  try {
    const { createServerClient } = await import("@insforge/sdk/ssr");
    const serverClient = createServerClient({
      cookies: responseCookies,
    });
    const { data } = await serverClient.auth.getCurrentUser();
    if (data?.user?.id) {
      const posthog = createPostHogServer();
      posthog.identify({ distinctId: data.user.id });
      await posthog.shutdown();
    }
  } catch (e) {
    console.error("[auth/callback] PostHog identify failed:", e);
  }

  return response;
}
