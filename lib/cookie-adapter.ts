import type { CookieStore } from "@insforge/sdk/ssr";
import { cookies } from "next/headers";

export async function createCookieAdapter(): Promise<CookieStore> {
  const store = await cookies();
  return {
    get: (name) => store.get(name)?.value ?? null,
    set: (...args: unknown[]) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (store.set as any)(...args);
    },
    delete: (...args: unknown[]) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (store.delete as any)(...args);
    },
  };
}
