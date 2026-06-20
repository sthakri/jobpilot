# Memory — Database Schema (Phase 1, Feature 04)

Last updated: 2026-06-20

## What was built

**Created via `run-raw-sql` MCP tool:**
- `profiles` table — 24 columns, PK referencing `auth.users(id)` ON DELETE CASCADE, RLS with 4 policies (select/insert/update/delete scoped to `id = auth.uid()`), `updated_at` auto-update trigger
- `agent_runs` table — 8 columns, PK with `gen_random_uuid()`, FK to `profiles(id)` CASCADE, RLS (4 policies scoped to `user_id = auth.uid()`), CHECK constraint on `status IN ('running', 'completed', 'failed')`
- `jobs` table — 24 columns, PK with `gen_random_uuid()`, FK to `profiles(id)` CASCADE and `agent_runs(id)` SET NULL, RLS (4 policies scoped to `user_id = auth.uid()`), CHECK constraint on `source IN ('search', 'url')`
- `agent_logs` table — 7 columns, PK with `gen_random_uuid()`, FK to `profiles(id)` CASCADE, `agent_runs(id)` CASCADE, and `jobs(id)` SET NULL, RLS (4 policies scoped to `user_id = auth.uid()`), CHECK constraint on `level IN ('info', 'success', 'warning', 'error')`
- Indexes: `user_id` on all four tables, `run_id` on `jobs` and `agent_logs`
- `resumes` storage bucket — private, authenticated access only

## Decisions made

- Foreign keys with cascading deletes: deleting a user cascades to profiles → agent_runs → jobs/agent_logs
- RLS policies named with table prefix convention (`profiles_select_own`, `jobs_insert_own`, etc.) for clarity
- `agent_logs.job_id` uses ON DELETE SET NULL — deleting a job preserves the log entry
- `jobs.run_id` uses ON DELETE SET NULL — an agent run can be deleted without losing discovered jobs
- Creation order matters: profiles → agent_runs → jobs → agent_logs (FK dependency chain)
- Used `gen_random_uuid()` for all non-profile PKs (profiles PK is the auth.users UUID)
- `is_complete` defaults to `false` — must be set explicitly when profile requirements are met

## Current state

- All four database tables exist with correct schemas, FKs, RLS policies, indexes, and CHECK constraints
- `resumes` storage bucket exists (private, 0 objects)
- Build plan progress-tracker.md updated — Feature 04 marked complete
- Phase 1 Foundation complete: Homepage, Auth, PostHog, Database Schema all done
- Next feature: 05 Profile Page — Full UI

## Next session starts with

Build Phase 2 — 05 Profile Page — Full UI:
- Read context files per AGENTS.md order
- Profile needs attention banner with completion percentage ring, missing field tags
- Resume section — drag and drop upload area, Select Resume button, Generate Resume button
- Profile Information form — Personal Info, Professional Info, Work Experience, Education, Job Preferences sections
- Save Profile button at bottom
- All UI with mock data initially — no save logic yet

## Open questions

- None currently — Feature 04 scope was completed end to end
