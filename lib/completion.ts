import type { ProfileFormData } from "@/types";

export const REQUIRED_FIELDS: (keyof ProfileFormData)[] = [
  "full_name",
  "phone",
  "location",
  "current_title",
  "experience_level",
  "years_experience",
  "skills",
  "work_experience",
  "education",
  "job_titles_seeking",
  "remote_preference",
];

export function computeCompletion(data: ProfileFormData) {
  const missingFields: string[] = [];

  for (const field of REQUIRED_FIELDS) {
    const value = data[field];

    if (value === null || value === undefined || value === "") {
      missingFields.push(field);
      continue;
    }

    if (Array.isArray(value) && value.length === 0) {
      missingFields.push(field);
    }
  }

  const filled = REQUIRED_FIELDS.length - missingFields.length;
  const percentage = Math.round((filled / REQUIRED_FIELDS.length) * 100);

  return {
    completionPercentage: percentage,
    isComplete: percentage === 100,
    missingFields: missingFields.map((f) => f.toUpperCase()),
  };
}
