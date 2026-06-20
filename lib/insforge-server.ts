import { createServerClient } from "@insforge/sdk/ssr";
import { cookies } from "next/headers";

export async function createInsforgeServer() {
  const cookieStore = await cookies();

  return createServerClient({
    cookies: {
      get: (name: string) => {
        const cookie = cookieStore.get(name);
        return cookie?.value ?? null;
      },
    },
  });
}
