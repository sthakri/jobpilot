"use server";

import { revalidatePath } from "next/cache";
import { createInsforgeServer } from "@/lib/insforge-server";

export async function updateResumeUrl(
  resumePdfUrl: string,
  resumeKey: string,
) {
  try {
    const insforge = await createInsforgeServer();
    const {
      data: { user },
      error: userError,
    } = await insforge.auth.getCurrentUser();
    if (userError || !user) {
      return { success: false, error: "Not authenticated" } as const;
    }

    const { error } = await insforge.database
      .from("profiles")
      .upsert({
        id: user.id,
        resume_pdf_url: resumePdfUrl,
        resume_key: resumeKey,
      })
      .select()
      .single();

    if (error) {
      console.error("[actions/resume]", error);
      return { success: false, error: "Failed to save resume" } as const;
    }

    revalidatePath("/profile");
    return { success: true } as const;
  } catch (error) {
    console.error("[actions/resume]", error);
    return { success: false, error: "Failed to save resume" } as const;
  }
}
