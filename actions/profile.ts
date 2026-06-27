"use server";

import { revalidatePath } from "next/cache";
import { createInsforgeServer } from "@/lib/insforge-server";
import { computeCompletion } from "@/lib/completion";
import type { ProfileFormData } from "@/types";

export async function saveProfile(data: ProfileFormData) {
  try {
    const insforge = await createInsforgeServer();

    const {
      data: { user },
      error: userError,
    } = await insforge.auth.getCurrentUser();
    if (userError || !user) {
      return { success: false, error: "Not authenticated" } as const;
    }

    const { completionPercentage, isComplete, missingFields } =
      computeCompletion(data);

    const payload = {
      full_name: data.full_name || null,
      email: data.email || null,
      phone: data.phone || null,
      location: data.location || null,
      current_title: data.current_title || null,
      experience_level: data.experience_level || null,
      years_experience: data.years_experience ?? null,
      skills: data.skills,
      industries: data.industries,
      work_experience: data.work_experience,
      education: data.education,
      job_titles_seeking: data.job_titles_seeking,
      remote_preference: data.remote_preference || null,
      preferred_locations: data.preferred_locations,
      salary_expectation: data.salary_expectation || null,
      linkedin_url: data.linkedin_url || null,
      portfolio_url: data.portfolio_url || null,
      work_authorization: data.work_authorization || null,
      cover_letter_tone: data.cover_letter_tone || null,
      is_complete: isComplete,
    };

    const { error } = await insforge.database
      .from("profiles")
      .upsert({ id: user.id, ...payload })
      .select()
      .single();

    if (error) {
      console.error("[actions/profile]", error);
      return { success: false, error: "Failed to save profile" } as const;
    }

    revalidatePath("/profile");

    return {
      success: true,
      completionPercentage,
      isComplete,
      missingFields,
    } as const;
  } catch (error) {
    console.error("[actions/profile]", error);
    return { success: false, error: "Failed to save profile" } as const;
  }
}
