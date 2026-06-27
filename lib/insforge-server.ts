import { createServerClient } from "@insforge/sdk/ssr";
import { createCookieAdapter } from "@/lib/cookie-adapter";

export async function createInsforgeServer() {
  const cookieAdapter = await createCookieAdapter();
  return createServerClient({ cookies: cookieAdapter });
}
