"use client";

import { useState, useTransition, useEffect, type ReactNode } from "react";
import { saveProfile } from "@/actions/profile";
import type { ProfileFormData, WorkExperience, Education } from "@/types";

type FieldProps = {
  label: string;
  children: ReactNode;
  className?: string;
};

type SectionTitleProps = {
  title: string;
  action?: ReactNode;
};

const inputClass =
  "w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-muted transition-colors focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent disabled:cursor-not-allowed disabled:bg-surface-secondary disabled:text-text-muted";
const selectClass = `${inputClass} appearance-none`;
const textareaClass = `${inputClass} resize-y`;

function Field({ label, children, className = "" }: FieldProps) {
  return (
    <div className={`space-y-2 ${className}`}>
      <label className="text-xs font-medium uppercase tracking-wider text-text-muted">
        {label}
      </label>
      {children}
    </div>
  );
}

function SectionTitle({ title, action }: SectionTitleProps) {
  return (
    <div className="mb-4 flex items-center justify-between gap-4">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-text-primary">
        {title}
      </h3>
      {action}
    </div>
  );
}

function SkillChip({
  label,
  onRemove,
}: {
  label: string;
  onRemove: () => void;
}) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-accent-muted px-2.5 py-1 text-xs font-medium text-accent">
      <span>{label}</span>
      <button
        type="button"
        onClick={onRemove}
        className="hover:text-accent-dark"
        aria-label={`Remove ${label}`}
      >
        <svg
          aria-hidden="true"
          className="h-3 w-3"
          fill="none"
          viewBox="0 0 24 24"
        >
          <path
            d="m6 6 12 12M18 6 6 18"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
          />
        </svg>
      </button>
    </span>
  );
}

type ProfileFormProps = {
  initialData?: ProfileFormData | null;
  extractedData?: Partial<ProfileFormData> | null;
};

export function ProfileForm({ initialData, extractedData }: ProfileFormProps) {
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<{
    success: boolean;
    error?: string;
  } | null>(null);
  const [revisionKey, setRevisionKey] = useState(0);

  const [skills, setSkills] = useState<string[]>(initialData?.skills ?? []);
  const [skillInput, setSkillInput] = useState("");
  const [industries, setIndustries] = useState<string[]>(
    initialData?.industries ?? [],
  );
  const [industryInput, setIndustryInput] = useState("");

  const [workExperience, setWorkExperience] = useState<WorkExperience[]>(
    initialData?.work_experience && initialData.work_experience.length > 0
      ? initialData.work_experience
      : [
          {
            companyName: "",
            jobTitle: "",
            startMonth: "",
            startYear: "",
            endMonth: "",
            endYear: "",
            currentlyWorking: false,
            responsibilities: "",
          },
        ],
  );
  const months = [
    "",
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 40 }, (_, i) => {
    const y = currentYear - i;
    return { value: String(y), label: String(y) };
  });

  const [education, setEducation] = useState<Education | null>(
    initialData?.education ?? null,
  );

  useEffect(() => {
    if (!extractedData) return;

    setTimeout(() => {
      if (extractedData.skills && extractedData.skills.length > 0) {
        setSkills((prev) => {
          const merged = [...prev];
          for (const s of extractedData.skills!) {
            if (!merged.includes(s)) merged.push(s);
          }
          return merged;
        });
      }
      if (extractedData.industries && extractedData.industries.length > 0) {
        setIndustries((prev) => {
          const merged = [...prev];
          for (const i of extractedData.industries!) {
            if (!merged.includes(i)) merged.push(i);
          }
          return merged;
        });
      }
      if (extractedData.work_experience && extractedData.work_experience.length > 0) {
        setWorkExperience(extractedData.work_experience);
      }
      if (extractedData.education) {
        setEducation(extractedData.education);
      }

      setRevisionKey((k) => k + 1);
    }, 0);
  }, [extractedData]);

  const mergedInitial: ProfileFormData = {
    full_name: extractedData?.full_name ?? initialData?.full_name ?? "",
    email: extractedData?.email ?? initialData?.email ?? "",
    phone: extractedData?.phone ?? initialData?.phone ?? "",
    location: extractedData?.location ?? initialData?.location ?? "",
    current_title: extractedData?.current_title ?? initialData?.current_title ?? "",
    experience_level: extractedData?.experience_level ?? initialData?.experience_level ?? "",
    years_experience: extractedData?.years_experience ?? initialData?.years_experience ?? null,
    skills,
    industries,
    work_experience: workExperience,
    education,
    job_titles_seeking: extractedData?.job_titles_seeking ?? initialData?.job_titles_seeking ?? [],
    remote_preference: extractedData?.remote_preference ?? initialData?.remote_preference ?? "",
    preferred_locations: extractedData?.preferred_locations ?? initialData?.preferred_locations ?? [],
    salary_expectation: extractedData?.salary_expectation ?? initialData?.salary_expectation ?? "",
    linkedin_url: extractedData?.linkedin_url ?? initialData?.linkedin_url ?? "",
    portfolio_url: extractedData?.portfolio_url ?? initialData?.portfolio_url ?? "",
    work_authorization: extractedData?.work_authorization ?? initialData?.work_authorization ?? "",
    cover_letter_tone: extractedData?.cover_letter_tone ?? initialData?.cover_letter_tone ?? "",
  };

  function addSkill() {
    const trimmed = skillInput.trim();
    if (trimmed && !skills.includes(trimmed)) {
      setSkills([...skills, trimmed]);
    }
    setSkillInput("");
  }

  function addIndustry() {
    const trimmed = industryInput.trim();
    if (trimmed && !industries.includes(trimmed)) {
      setIndustries([...industries, trimmed]);
    }
    setIndustryInput("");
  }

  function updateRole(index: number, field: keyof WorkExperience, value: unknown) {
    setWorkExperience((prev) =>
      prev.map((role, i) => (i === index ? { ...role, [field]: value } : role)),
    );
  }

  function addRole() {
    setWorkExperience([
      ...workExperience,
      {
        companyName: "",
        jobTitle: "",
        startMonth: "",
        startYear: "",
        endMonth: "",
        endYear: "",
        currentlyWorking: false,
        responsibilities: "",
      },
    ]);
  }

  function removeRole(index: number) {
    setWorkExperience(workExperience.filter((_, i) => i !== index));
  }

  function handleSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setResult(null);

    const formData = new FormData(event.currentTarget);

    const data: ProfileFormData = {
      full_name: (formData.get("fullName") as string) ?? "",
      email: (formData.get("email") as string) ?? "",
      phone: (formData.get("phone") as string) ?? "",
      location: (formData.get("location") as string) ?? "",
      current_title: (formData.get("currentTitle") as string) ?? "",
      experience_level: (formData.get("experienceLevel") as string) ?? "",
      years_experience: formData.get("yearsExperience")
        ? Number(formData.get("yearsExperience"))
        : null,
      skills,
      industries,
      work_experience: workExperience,
      education,
      job_titles_seeking: (
        (formData.get("jobTitlesSeeking") as string) ?? ""
      )
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      remote_preference: (formData.get("remotePreference") as string) ?? "",
      preferred_locations: (
        (formData.get("preferredLocations") as string) ?? ""
      )
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      salary_expectation: (formData.get("salaryExpectation") as string) ?? "",
      linkedin_url: (formData.get("linkedinUrl") as string) ?? "",
      portfolio_url: (formData.get("portfolioUrl") as string) ?? "",
      work_authorization: (formData.get("workAuthorization") as string) ?? "",
      cover_letter_tone: (formData.get("coverLetterTone") as string) ?? "",
    };

    startTransition(async () => {
      const res = await saveProfile(data);
      setResult(res);
    });
  }

  return (
    <form key={revisionKey} onSubmit={handleSave}>
      <section className="rounded-2xl border border-border bg-surface p-6 shadow-card md:p-8">
        <div className="space-y-6">
          <div className="space-y-1 border-b border-border pb-5">
            <h2 className="text-base font-semibold text-text-primary">
              Profile Information
            </h2>
            <p className="text-sm leading-5 text-text-secondary">
              This context is used to accurately represent you in agent
              interactions.
            </p>
          </div>

          <div className="space-y-6">
            <div>
              <SectionTitle title="Personal Info" />
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Field label="Full Name">
                  <input
                    className={inputClass}
                    defaultValue={mergedInitial.full_name}
                    name="fullName"
                    placeholder="E.g. John Doe"
                    type="text"
                  />
                </Field>
                <Field label="Email">
                  <input
                    className={inputClass}
                    defaultValue={mergedInitial.email}
                    name="email"
                    placeholder="john@example.com"
                    type="email"
                  />
                </Field>
                <Field label="Phone Number">
                  <input
                    className={inputClass}
                    defaultValue={mergedInitial.phone}
                    name="phone"
                    inputMode="numeric"
                    pattern="[\d\s\+\-\(\)]+"
                    placeholder="+1 (555) 000-0000"
                    type="tel"
                  />
                </Field>
                <Field label="Location">
                  <input
                    className={inputClass}
                    defaultValue={mergedInitial.location}
                    name="location"
                    placeholder="City, Country"
                    type="text"
                  />
                </Field>
                <Field label="LinkedIn URL">
                  <input
                    className={inputClass}
                    defaultValue={mergedInitial.linkedin_url}
                    name="linkedinUrl"
                    placeholder="https://linkedin.com/in/..."
                    type="url"
                  />
                </Field>
                <Field label="Portfolio / GitHub">
                  <input
                    className={inputClass}
                    defaultValue={mergedInitial.portfolio_url}
                    name="portfolioUrl"
                    placeholder="https://github.com/..."
                    type="url"
                  />
                </Field>
                <Field label="Work Authorization">
                  <select
                    className={selectClass}
                    defaultValue={mergedInitial.work_authorization}
                    name="workAuthorization"
                  >
                    <option value="">Select authorization</option>
                    <option>Citizen</option>
                    <option>Permanent Resident</option>
                    <option>Work Visa (H1B)</option>
                    <option>Work Visa (Other)</option>
                    <option>Student Visa (OPT/CPT)</option>
                    <option>Requires Sponsorship</option>
                  </select>
                </Field>
              </div>
            </div>

            <div className="border-t border-border pt-6">
              <SectionTitle title="Professional Info" />
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Field className="md:col-span-2" label="Current/Recent Job Title">
                  <input
                    className={inputClass}
                    defaultValue={mergedInitial.current_title}
                    name="currentTitle"
                    placeholder="E.g. Frontend Engineer"
                    type="text"
                  />
                </Field>
                <Field label="Experience Level">
                  <select
                    className={selectClass}
                    defaultValue={mergedInitial.experience_level}
                    name="experienceLevel"
                  >
                    <option value="">Select level</option>
                    <option>Junior</option>
                    <option>Mid</option>
                    <option>Senior</option>
                    <option>Lead</option>
                  </select>
                </Field>
                <Field label="Years of Experience">
                  <input
                    className={inputClass}
                    defaultValue={mergedInitial.years_experience?.toString() ?? ""}
                    min="0"
                    name="yearsExperience"
                    placeholder="E.g. 5"
                    type="number"
                  />
                </Field>
                <Field className="md:col-span-2" label="Skills">
                  <div className="flex gap-2">
                    <input
                      className={`${inputClass} flex-1`}
                      placeholder="Add a skill"
                      type="text"
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addSkill();
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={addSkill}
                      className="rounded-md border border-border bg-surface px-3 py-2 text-xs font-medium text-text-primary transition-colors hover:bg-surface-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
                    >
                      Add
                    </button>
                  </div>
                  {skills.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {skills.map((skill) => (
                        <SkillChip
                          key={skill}
                          label={skill}
                          onRemove={() =>
                            setSkills(skills.filter((s) => s !== skill))
                          }
                        />
                      ))}
                    </div>
                  )}
                </Field>
                <Field className="md:col-span-2" label="Industries worked in (optional)">
                  <div className="flex gap-2">
                    <input
                      className={`${inputClass} flex-1`}
                      placeholder="E.g. FinTech, Healthcare"
                      type="text"
                      value={industryInput}
                      onChange={(e) => setIndustryInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addIndustry();
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={addIndustry}
                      className="rounded-md border border-border bg-surface px-3 py-2 text-xs font-medium text-text-primary transition-colors hover:bg-surface-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
                    >
                      Add
                    </button>
                  </div>
                  {industries.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {industries.map((ind) => (
                        <SkillChip
                          key={ind}
                          label={ind}
                          onRemove={() =>
                            setIndustries(industries.filter((i) => i !== ind))
                          }
                        />
                      ))}
                    </div>
                  )}
                </Field>
              </div>
            </div>

            <div className="border-t border-border pt-6">
              <SectionTitle
                title="Work Experience"
                action={
                  <button
                    type="button"
                    onClick={addRole}
                    className="inline-flex items-center gap-1 text-sm font-medium text-accent transition-colors hover:text-accent-dark"
                  >
                    <svg
                      aria-hidden="true"
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <path
                        d="M12 5v14M5 12h14"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                      />
                    </svg>
                    Add role
                  </button>
                }
              />
              {workExperience.map((role, index) => (
                <div
                  key={index}
                  className="mb-4 rounded-2xl border border-border bg-surface p-4"
                >
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <Field label="Company Name">
                      <input
                        className={inputClass}
                        value={role.companyName}
                        onChange={(e) =>
                          updateRole(index, "companyName", e.target.value)
                        }
                        name={`companyName-${index}`}
                        type="text"
                      />
                    </Field>
                    <Field label="Job Title">
                      <input
                        className={inputClass}
                        value={role.jobTitle}
                        onChange={(e) =>
                          updateRole(index, "jobTitle", e.target.value)
                        }
                        name={`jobTitle-${index}`}
                        type="text"
                      />
                    </Field>
                <Field label="Start Date">
                  <div className="grid grid-cols-2 gap-3">
                    <select
                      className={selectClass}
                      value={role.startMonth}
                      onChange={(e) => {
                        updateRole(index, "startMonth", e.target.value);
                      }}
                    >
                      <option value="">Month</option>
                      {months.slice(1).map((m) => (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      ))}
                    </select>
                    <select
                      className={selectClass}
                      value={role.startYear}
                      onChange={(e) => {
                        updateRole(index, "startYear", e.target.value);
                      }}
                    >
                      <option value="">Year</option>
                      {years.map((y) => (
                        <option key={y.value} value={y.value}>
                          {y.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </Field>
                <Field label="End Date">
                  <div className="grid grid-cols-[1fr_1fr_auto] gap-3">
                    <select
                      className={selectClass}
                      disabled={role.currentlyWorking}
                      value={role.currentlyWorking ? "" : role.endMonth}
                      onChange={(e) => {
                        updateRole(index, "endMonth", e.target.value);
                      }}
                    >
                      <option value="">Month</option>
                      {months.slice(1).map((m) => (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      ))}
                    </select>
                    <select
                      className={selectClass}
                      disabled={role.currentlyWorking}
                      value={role.currentlyWorking ? "" : role.endYear}
                      onChange={(e) => {
                        updateRole(index, "endYear", e.target.value);
                      }}
                    >
                      <option value="">Year</option>
                      {years.map((y) => (
                        <option key={y.value} value={y.value}>
                          {y.label}
                        </option>
                      ))}
                    </select>
                    <label className="inline-flex items-center gap-2 whitespace-nowrap text-xs font-medium text-text-secondary">
                      <input
                        className="h-4 w-4 rounded border-border bg-surface text-accent accent-accent focus:ring-accent"
                        checked={role.currentlyWorking}
                        onChange={(e) => {
                          updateRole(index, "currentlyWorking", e.target.checked);
                        }}
                        type="checkbox"
                      />
                      Currently working here
                    </label>
                  </div>
                </Field>
                  </div>
                  <Field className="mt-4" label="Key Responsibilities">
                    <textarea
                      className={`${textareaClass} min-h-[96px]`}
                      value={role.responsibilities}
                      onChange={(e) =>
                        updateRole(index, "responsibilities", e.target.value)
                      }
                      rows={3}
                    />
                  </Field>
                  {workExperience.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeRole(index)}
                      className="mt-3 text-xs font-medium text-error hover:text-error"
                    >
                      Remove role
                    </button>
                  )}
                </div>
              ))}
            </div>

            <div className="border-t border-border pt-6">
              <SectionTitle title="Education" />
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Field label="Highest Degree">
                  <select
                    className={selectClass}
                    value={education?.highestDegree ?? ""}
                    onChange={(e) =>
                      setEducation(
                        education
                          ? { ...education, highestDegree: e.target.value }
                          : {
                              highestDegree: e.target.value,
                              fieldOfStudy: "",
                              institutionName: "",
                              graduationYear: "",
                            },
                      )
                    }
                  >
                    <option>High School</option>
                    <option>Associate Degree</option>
                    <option>Bachelor&apos;s Degree</option>
                    <option>Master&apos;s Degree</option>
                    <option>Doctorate</option>
                  </select>
                </Field>
                <Field label="Field of Study">
                  <input
                    className={inputClass}
                    value={education?.fieldOfStudy ?? ""}
                    onChange={(e) =>
                      setEducation(
                        education
                          ? { ...education, fieldOfStudy: e.target.value }
                          : {
                              highestDegree: "",
                              fieldOfStudy: e.target.value,
                              institutionName: "",
                              graduationYear: "",
                            },
                      )
                    }
                    placeholder="Computer Science"
                    type="text"
                  />
                </Field>
                <Field label="Institution Name">
                  <input
                    className={inputClass}
                    value={education?.institutionName ?? ""}
                    onChange={(e) =>
                      setEducation(
                        education
                          ? { ...education, institutionName: e.target.value }
                          : {
                              highestDegree: "",
                              fieldOfStudy: "",
                              institutionName: e.target.value,
                              graduationYear: "",
                            },
                      )
                    }
                    placeholder="E.g. State University"
                    type="text"
                  />
                </Field>
                <Field label="Graduation Year">
                  <input
                    className={inputClass}
                    value={education?.graduationYear ?? ""}
                    onChange={(e) =>
                      setEducation(
                        education
                          ? { ...education, graduationYear: e.target.value }
                          : {
                              highestDegree: "",
                              fieldOfStudy: "",
                              institutionName: "",
                              graduationYear: e.target.value,
                            },
                      )
                    }
                    placeholder="YYYY"
                    type="text"
                  />
                </Field>
              </div>
            </div>

            <div className="border-t border-border pt-6">
              <SectionTitle title="Job Preferences" />
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Field className="md:col-span-2" label="Job Titles Seeking">
                  <input
                    className={inputClass}
                    defaultValue={mergedInitial.job_titles_seeking?.join(", ") ?? ""}
                    name="jobTitlesSeeking"
                    placeholder="Separate with commas"
                    type="text"
                  />
                </Field>
                <Field label="Remote Preference">
                  <select
                    className={selectClass}
                    defaultValue={mergedInitial.remote_preference}
                    name="remotePreference"
                  >
                    <option value="">Select preference</option>
                    <option>Any</option>
                    <option>Remote</option>
                    <option>Hybrid</option>
                    <option>Onsite</option>
                  </select>
                </Field>
                <Field label="Cover Letter Tone">
                  <select
                    className={selectClass}
                    defaultValue={mergedInitial.cover_letter_tone}
                    name="coverLetterTone"
                  >
                    <option value="">Select tone</option>
                    <option>Professional</option>
                    <option>Enthusiastic</option>
                    <option>Confident</option>
                    <option>Friendly</option>
                    <option>Concise</option>
                    <option>Warm</option>
                  </select>
                </Field>
                <Field label="Salary Expectation (optional)">
                  <input
                    className={inputClass}
                    defaultValue={mergedInitial.salary_expectation}
                    name="salaryExpectation"
                    placeholder="E.g. $120k+"
                    type="text"
                  />
                </Field>
                <Field className="md:col-span-2" label="Preferred Locations (optional)">
                  <input
                    className={inputClass}
                    defaultValue={mergedInitial.preferred_locations?.join(", ") ?? ""}
                    name="preferredLocations"
                    placeholder="E.g. New York, London"
                    type="text"
                  />
                </Field>
              </div>
            </div>
          </div>

          {result && (
            <div
              className={`rounded-lg p-3 text-sm ${
                result.success
                  ? "bg-success-lightest text-success-foreground"
                  : "bg-error/5 text-error"
              }`}
            >
              {result.success
                ? "Profile saved successfully!"
                : result.error ?? "Something went wrong"}
            </div>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="w-full rounded-md bg-accent px-4 py-3 text-sm font-medium text-accent-foreground shadow-sm transition-colors hover:bg-accent-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isPending ? "Saving..." : "Save Profile"}
          </button>
        </div>
      </section>
    </form>
  );
}
