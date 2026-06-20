# Progress Tracker

Update this file after every completed feature. Any AI agent reading this should immediately know what is done, what is in progress, and what is next.

---

## Current Status

**Phase:** Phase 1 — Foundation
**Last completed:** 04 Database Schema
**Next:** 05 Profile Page — Full UI

---

## Progress

### Phase 1 — Foundation

- [x] 01 Homepage
- [x] 02 Auth
- [x] 03 PostHog Initialization
- [x] 04 Database Schema

### Phase 2 — Profile Page

- [ ] 05 Profile Page — Full UI
- [ ] 06 Profile Save Logic
- [ ] 07 AI Profile Extraction from Resume
- [ ] 08 Resume PDF Generation from Profile

### Phase 3 — Find Jobs Page

- [ ] 09 Find Jobs Page — Full UI
- [ ] 10 Adzuna Job Discovery
- [ ] 11 Filter + Sort + Pagination

### Phase 4 — Job Details Page

- [ ] 12 Job Details Page — Full UI
- [ ] 13 Company Research Agent

### Phase 5 — Dashboard

- [ ] 14 Dashboard Page — Full UI
- [ ] 15 Stats Bar — Real Data
- [ ] 16 Recent Activity — Real Data
- [ ] 17 Analytics Charts — PostHog Data

---

## Decisions Made During Build

- Dark CTA buttons (Get Started, Start for free) use `bg-overlay-dark` / `text-accent-foreground` because there is no dedicated dark-button token yet.
- Hero and bottom CTA gradient panels use `bg-gradient-to-br from-accent-light/50 to-info-light/50` to match the landing page gradient using existing tokens.
- CTA links (Get Started, Find Your First Match, Start for free) point to `/login` until authentication is implemented.
- Footer legal links (Privacy Policy, Terms & Condition) use `#` placeholders until those pages exist.
- Mobile navigation is hidden (`hidden md:flex`) because a mobile menu was not in the landing page design.
- Feature icons are inline SVGs with `currentColor` stroke to avoid adding an icon library for the homepage alone.
- Card shadow is implemented as a custom `.shadow-card` utility in `app/globals.css` so the same shadow can be reused without inline arbitrary values.
- Auth: `@insforge/sdk/ssr` sub-export (not `@insforge/ssr`) — confirmed via npm info and type definitions.
- Auth: `createBrowserClient()` reads env vars automatically — no args needed.
- Auth: PKCE flow — Server Action returns `{ url, codeVerifier }`, verifier stored in httpOnly cookie (10min maxAge, path `/callback`), callback page exchanges code for tokens.
- Auth: `createCookieAdapter()` wraps Next.js `cookies()` with rest-arg `set`/`delete` to handle overloaded Next.js cookie store signatures.
- Auth: Login page uses `Suspense` boundary because `useSearchParams()` requires it in Next.js 16.
- Auth: Middleware uses `updateSession()` from `@insforge/sdk/ssr` for cookie-based session validation and token refresh.
- Auth: Using `proxy.ts` (not deprecated `middleware.ts`) per Next.js 16 convention.
- Auth: Fixed `redirectTo` URL — was pointing to InsForge backend (`NEXT_PUBLIC_INSFORGE_URL/callback`) instead of app URL; now uses `NEXT_PUBLIC_APP_URL/callback`.
- Auth: Added `NEXT_PUBLIC_APP_URL=http://localhost:3000` to `.env.local` for proper OAuth callback routing.
- Auth: Fixed per-provider loading state — replaced `useTransition` with `useState<string | null>` so only the clicked button shows loading state.
- Auth: Redesigned login page with gradient background, blurred decorative circles, pill-shaped OAuth buttons with hover lift effect, spinner during loading, brand icon, divider, and error container.
- Auth: Converted callback from server component page (`app/(auth)/callback/page.tsx`) to Route Handler (`app/api/auth/callback/route.ts`) because server components cannot write cookies — `exchangeOAuthCode` needs to persist session tokens via `Set-Cookie` headers on the response. Uses `requestCookies`/`responseCookies` pattern instead of `cookies`.
- Auth: Updated PKCE verifier cookie path from `/callback` to `/api/auth/callback` to match the new Route Handler path.
- Auth: Navbar is an async server component that checks `getCurrentUser()` server-side; LogoutButton is a separate client component.
- Auth: `createRefreshAuthRouter()` generates the POST handler for `/api/auth/refresh` automatically.
- PostHog: `lib/posthog-client.ts` exports `captureEvent()`, `identifyUser()`, `resetUser()` wrapping browser-side `posthog-js`.
- PostHog: `lib/posthog-server.ts` exports `createPostHogServer()` and `captureServerEvent()` for server-side events with `flushAt: 1`, `flushInterval: 0`, and mandatory `shutdown()`.
- PostHog: `PostHogIdentify` client component (`providers/posthog-identify.tsx`) calls `posthog.identify(userId)` on mount — rendered in profile page, will be added to all authenticated pages as they're built.
- PostHog: Server-side `posthog.identify()` fired in OAuth callback route handler after successful code exchange.
- PostHog: `resetUser()` called in `LogoutButton` before signOut.
- DB Schema: Created all four tables (`profiles`, `agent_runs`, `jobs`, `agent_logs`) with full columns, FK constraints, RLS (SELECT/INSERT/UPDATE/DELETE scoped to auth.uid()), CHECK constraints on enum-like columns (`source`, `status`, `level`), and indexes on `user_id` and `run_id`.
- DB Schema: `profiles.updated_at` auto-updates via trigger function `update_updated_at_column()`.
- DB Schema: Created `resumes` storage bucket (private, authenticated access only).

---

## Notes

- Homepage built from `public/images/dashboard-demo.png`, `jobs-lists.png`, `agnet-log.png`, `user-icon.png`, and `logo.png`.
- All components are Server Components and use only the design tokens from `globals.css`.
