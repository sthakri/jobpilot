export type WorkExperience = {
  companyName: string;
  jobTitle: string;
  startMonth: string;
  startYear: string;
  endMonth: string;
  endYear: string;
  currentlyWorking: boolean;
  responsibilities: string;
};

export type Education = {
  highestDegree: string;
  fieldOfStudy: string;
  institutionName: string;
  graduationYear: string;
};

export type Profile = {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  location: string;
  current_title: string;
  experience_level: string;
  years_experience: number;
  skills: string[];
  industries: string[];
  work_experience: WorkExperience[];
  education: Education | null;
  job_titles_seeking: string[];
  remote_preference: string;
  preferred_locations: string[];
  salary_expectation: string;
  linkedin_url: string;
  portfolio_url: string;
  work_authorization: string;
  cover_letter_tone: string;
  resume_pdf_url: string;
  resume_key: string;
  generated_resume_url: string;
  generated_resume_key: string;
  is_complete: boolean;
  created_at: string;
  updated_at: string;
};

export type ProfileFormData = {
  full_name: string;
  email: string;
  phone: string;
  location: string;
  current_title: string;
  experience_level: string;
  years_experience: number | null;
  skills: string[];
  industries: string[];
  work_experience: WorkExperience[];
  education: Education | null;
  job_titles_seeking: string[];
  remote_preference: string;
  preferred_locations: string[];
  salary_expectation: string;
  linkedin_url: string;
  portfolio_url: string;
  work_authorization: string;
  cover_letter_tone: string;
};

export function mapProfileFromDb(row: Record<string, unknown>): Profile {
  return {
    id: String(row.id ?? ""),
    full_name: String(row.full_name ?? ""),
    email: String(row.email ?? ""),
    phone: String(row.phone ?? ""),
    location: String(row.location ?? ""),
    current_title: String(row.current_title ?? ""),
    experience_level: String(row.experience_level ?? ""),
    years_experience: typeof row.years_experience === "number" ? row.years_experience : 0,
    skills: Array.isArray(row.skills) ? (row.skills as string[]) : [],
    industries: Array.isArray(row.industries) ? (row.industries as string[]) : [],
    work_experience: Array.isArray(row.work_experience) ? (row.work_experience as WorkExperience[]) : [],
    education: row.education != null ? (row.education as Education) : null,
    job_titles_seeking: Array.isArray(row.job_titles_seeking) ? (row.job_titles_seeking as string[]) : [],
    remote_preference: String(row.remote_preference ?? ""),
    preferred_locations: Array.isArray(row.preferred_locations) ? (row.preferred_locations as string[]) : [],
    salary_expectation: String(row.salary_expectation ?? ""),
    linkedin_url: String(row.linkedin_url ?? ""),
    portfolio_url: String(row.portfolio_url ?? ""),
    work_authorization: String(row.work_authorization ?? ""),
    cover_letter_tone: String(row.cover_letter_tone ?? ""),
    resume_pdf_url: String(row.resume_pdf_url ?? ""),
    resume_key: String(row.resume_key ?? ""),
    generated_resume_url: String(row.generated_resume_url ?? ""),
    generated_resume_key: String(row.generated_resume_key ?? ""),
    is_complete: row.is_complete === true,
    created_at: String(row.created_at ?? ""),
    updated_at: String(row.updated_at ?? ""),
  };
}

export type Job = {
  id: string;
  run_id: string | null;
  user_id: string;
  source: "search" | "url";
  source_url: string | null;
  external_apply_url: string | null;
  title: string | null;
  company: string | null;
  location: string | null;
  salary: string | null;
  job_type: string | null;
  about_role: string | null;
  responsibilities: string[] | null;
  requirements: string[] | null;
  nice_to_have: string[] | null;
  benefits: string[] | null;
  about_company: string | null;
  match_score: number | null;
  match_reason: string | null;
  matched_skills: string[] | null;
  missing_skills: string[] | null;
  company_research: Record<string, unknown> | null;
  description_enriched: boolean | null;
  found_at: string | null;
};
