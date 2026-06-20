import { updateSession } from "@insforge/sdk/ssr";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const protectedRoutes = ["/dashboard", "/profile", "/find-jobs"];

function wrapRequestCookies(request: NextRequest) {
  return {
    get: (name: string) => request.cookies.get(name)?.value ?? null,
    set: (...args: unknown[]) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (request.cookies.set as any)(...args);
    },
    delete: (...args: unknown[]) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (request.cookies.delete as any)(...args);
    },
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

export async function proxy(request: NextRequest) {
  const requestCookies = wrapRequestCookies(request);
  const response = NextResponse.next();
  const responseCookies = wrapResponseCookies(response);

  const { accessToken } = await updateSession({
    requestCookies,
    responseCookies,
  });

  const { pathname } = request.nextUrl;
  const isProtected = protectedRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  if (isProtected && !accessToken) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (pathname === "/login" && accessToken) {
    return NextResponse.redirect(new URL("/profile", request.url));
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|logo.png|images|robots.txt).*)",
  ],
};
