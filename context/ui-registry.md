# UI Registry

Living document. Updated after every component is built. Read this before building any new component — match existing patterns exactly before inventing new ones.

---

## How to Use

Before building any component:

1. Check if a similar component already exists here
2. If yes — match its exact classes
3. If no — build it following ui-rules.md and ui-tokens.md, then add it here

After building any component — update this file with the component name, file path, and exact classes used.

---

## Baseline Patterns

These patterns apply to all homepage components and should be reused across the app.

| Property      | Class                                | Notes                                      |
| ------------- | ------------------------------------ | ------------------------------------------ |
| Page max-width | `max-w-[1440px] mx-auto`             | 1440px centered container from ui-rules.md |
| Page gutters  | `px-8` (sections) / `px-6` (navbar)  | Consistent horizontal padding              |
| Page surface  | `bg-background`                      | `body` already sets `bg-background`        |
| Section gap   | `py-20` / `pb-20` / `pt-12`          | Vertical rhythm                            |
| Card shadow   | `shadow-card`                        | Custom utility from `app/globals.css`      |

---

## Components

### Navbar

File: `components/layout/Navbar.tsx`
Last updated: 2026-06-19

| Property         | Class                                                                   |
| ---------------- | ----------------------------------------------------------------------- |
| Background       | `bg-surface`                                                            |
| Border           | `border-b border-border`                                                |
| Height           | `h-16`                                                                  |
| Logo             | `h-8 w-auto` (Image from `/logo.png`)                                 |
| Nav link text    | `text-sm font-medium text-text-dark hover:text-accent transition-colors` |
| CTA button       | `bg-overlay-dark text-accent-foreground px-4 py-2 rounded-md font-medium` |
| CTA hover        | `hover:bg-overlay`                                                      |

**Pattern notes:**
- Logo is an image with text baked in; no separate text element.
- Navigation links are hidden on mobile (`hidden md:flex`) until mobile menu is built.
- Dark CTA reuses overlay tokens because there is no dedicated dark-button token.

---

### Footer

File: `components/layout/Footer.tsx`
Last updated: 2026-06-19

| Property         | Class                                                                   |
| ---------------- | ----------------------------------------------------------------------- |
| Background       | `bg-surface`                                                            |
| Border           | `border-t border-border`                                                |
| Logo             | `h-8 w-auto` (Image from `/logo.png`)                                 |
| Link text        | `text-sm font-medium text-text-dark hover:text-accent transition-colors` |
| Layout           | `flex items-center justify-between`                                     |

**Pattern notes:**
- Legal links use `#` placeholders until pages exist.
- Footer is pushed to the bottom by `mt-auto` in a flex column layout.

---

### Hero

File: `components/homepage/Hero.tsx`
Last updated: 2026-06-19

| Property         | Class                                                                                  |
| ---------------- | -------------------------------------------------------------------------------------- |
| Background       | `bg-background` section; inner gradient `bg-gradient-to-br from-accent-light/50 to-info-light/50` |
| Border radius    | `rounded-2xl` (inner gradient panel)                                                   |
| Heading          | `text-5xl font-semibold text-text-primary tracking-tight leading-tight`                |
| Subheading       | `text-base text-text-secondary`                                                        |
| Primary button   | `bg-overlay-dark text-accent-foreground px-4 py-2 rounded-md font-medium` + arrow icon |
| Secondary button | `bg-surface text-text-primary border border-border px-4 py-2 rounded-md font-medium`   |
| Hover states     | Primary `hover:bg-overlay`, secondary `hover:bg-surface-secondary`                     |
| Button gap       | `gap-3`                                                                                |

**Pattern notes:**
- Hero is a full-width section with a rounded gradient panel inside the 1440px container.
- Dark primary button uses overlay tokens as a dark-button substitute.
- Arrow icon is the shared `ArrowRightIcon` component with `currentColor` stroke.

---

### DashboardPreview

File: `components/homepage/DashboardPreview.tsx`
Last updated: 2026-06-19

| Property         | Class                                                                                              |
| ---------------- | -------------------------------------------------------------------------------------------------- |
| Background       | `bg-surface`                                                                                       |
| Border           | `border border-border`                                                                             |
| Border radius    | `rounded-2xl` (outer card), `rounded-xl` (inner image)                                             |
| Padding          | `p-3`                                                                                              |
| Shadow           | `shadow-card` (custom utility from `app/globals.css`)                                              |
| Image wrapper    | `relative w-full aspect-[2/1] overflow-hidden bg-surface`                                          |
| Image fit        | `object-contain`                                                                                   |
| Max width        | `max-w-5xl mx-auto`                                                                                |

**Pattern notes:**
- Aspect ratio is `2/1` to match the actual dashboard screenshot dimensions.
- Card shadow matches the standard card shadow from ui-tokens.md.

---

### Feature Section (image + feature list)

Files: `components/homepage/JobSearchFeatures.tsx`, `components/homepage/ConfidenceFeatures.tsx`
Last updated: 2026-06-19

| Property         | Class                                                                                              |
| ---------------- | -------------------------------------------------------------------------------------------------- |
| Grid             | `grid grid-cols-1 lg:grid-cols-2 gap-12 items-center`                                              |
| Heading          | `text-4xl font-semibold text-text-primary leading-tight`                                           |
| Feature item     | `pl-4 border-l-2` with `border-accent` (highlighted) or `border-border`                            |
| Feature title    | `text-base font-semibold text-text-primary`                                                        |
| Feature body     | `text-sm text-text-secondary leading-relaxed`                                                      |
| Feature icon     | `w-5 h-5 text-accent` inline SVG (stroke currentColor)                                           |
| Image card       | `bg-surface border border-border rounded-2xl p-3 shadow-card`                                       |
| Image wrapper    | `relative w-full aspect-[4/3] overflow-hidden rounded-xl bg-surface`                               |
| Image fit        | `object-contain`                                                                                   |
| Order            | Mobile stacks text first; on desktop the image can be ordered `lg:order-1`/`lg:order-2`            |

**Pattern notes:**
- The first feature item is highlighted with `border-accent` to match the landing page design.
- Feature icons are 20px accent-colored SVGs rendered inline to avoid adding an icon library just for the homepage.
- Image cards mirror the `DashboardPreview` card styling.

---

### Testimonial

File: `components/homepage/Testimonial.tsx`
Last updated: 2026-06-19

| Property         | Class                                                                                              |
| ---------------- | -------------------------------------------------------------------------------------------------- |
| Alignment        | `text-center`                                                                                      |
| Eyebrow label    | `text-xs font-semibold uppercase tracking-widest text-accent`                                      |
| Quote            | `text-xl font-medium text-text-primary leading-relaxed max-w-2xl mx-auto`                          |
| Avatar wrapper   | `relative w-10 h-10 rounded-full overflow-hidden bg-surface-secondary`                             |
| Avatar fit       | `object-cover`                                                                                     |
| Name             | `text-sm font-semibold text-text-primary`                                                          |
| Role             | `text-xs text-text-secondary`                                                                      |

**Pattern notes:**
- Eyebrow is the only accent text on the section to match the “SUCCESS STORIES” label in the design.
- Avatar is 40px with a fallback surface background.

---

### BottomCta

File: `components/homepage/BottomCta.tsx`
Last updated: 2026-06-19

| Property         | Class                                                                                              |
| ---------------- | -------------------------------------------------------------------------------------------------- |
| Background       | `bg-background` section; inner gradient `bg-gradient-to-br from-accent-light/50 to-info-light/50` |
| Border radius    | `rounded-2xl` (inner panel)                                                                        |
| Heading          | `text-4xl font-semibold text-text-primary leading-tight max-w-2xl mx-auto`                         |
| Body             | `text-base text-text-secondary max-w-lg mx-auto`                                                   |
| Primary button   | `bg-overlay-dark text-accent-foreground px-4 py-2 rounded-md font-medium` + arrow icon             |
| Secondary button | `bg-surface text-text-primary border border-border px-4 py-2 rounded-md font-medium`               |
| Hover states     | Primary `hover:bg-overlay`, secondary `hover:bg-surface-secondary`                                 |

**Pattern notes:**
- Reuses the same gradient panel and button pattern as `Hero` for visual consistency.
- Both CTAs currently link to `/login` until authentication is built.

---

### ArrowRightIcon

File: `components/homepage/ArrowRightIcon.tsx`
Last updated: 2026-06-19

| Property | Class |
| -------- | ----- |
| Size     | `w-4 h-4` when used inside buttons |
| Color    | `currentColor` stroke |

**Pattern notes:**
- Icon inherits the button text color so it works on dark and light buttons without extra tokens.

---

### Login Page

File: `app/(auth)/login/page.tsx`
Last updated: 2026-06-19

| Property         | Class                                                                   |
| ---------------- | ----------------------------------------------------------------------- |
| Layout           | `min-h-screen flex items-center justify-center bg-background px-4`      |
| Card max-width   | `w-full max-w-sm`                                                       |

**Pattern notes:**
- Server component — just a Suspense wrapper around `LoginForm`.
- Suspense boundary required because `LoginForm` uses `useSearchParams()`.

---

### LoginForm

File: `app/(auth)/login/LoginForm.tsx`
Last updated: 2026-06-19

| Property         | Class                                                                   |
| ---------------- | ----------------------------------------------------------------------- |
| Card             | `bg-surface border border-border rounded-2xl p-8 shadow-card`          |
| Heading          | `text-2xl font-semibold text-text-primary`                             |
| Subheading       | `mt-2 text-sm text-text-secondary`                                     |
| OAuth button     | `w-full flex items-center justify-center gap-3 bg-surface border border-border rounded-md px-4 py-2.5 text-sm font-medium text-text-primary hover:bg-surface-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed` |
| Error text       | `mt-6 p-3 rounded-lg bg-error/5 border border-error/20 text-sm text-error text-center` |
| Button spacing   | `space-y-3`                                                            |
| Brand icon       | `w-14 h-14 rounded-xl bg-gradient-to-br from-accent to-accent-dark shadow-lg shadow-accent/20` |
| Heading          | `text-3xl font-semibold text-text-primary tracking-tight`              |
| Subheading       | `mt-2 text-base text-text-secondary`                                  |
| Divider          | `flex items-center gap-3` with `h-px bg-border` lines and `text-xs font-medium uppercase tracking-widest text-text-muted` label |
| Card padding     | `p-10`                                                                 |
| Card max-width   | `w-full max-w-md`                                                      |
| OAuth button     | `w-full flex items-center justify-center gap-3 bg-surface border border-border rounded-full px-6 py-3 text-sm font-medium text-text-primary hover:bg-surface-secondary hover:shadow-md hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed` |

**Pattern notes:**
- Client component ("use client") — uses `useState<string | null>` for per-provider loading state (not `useTransition`).
- Google and GitHub icons are inline SVGs (20×20) — no icon library added.
- Spinner component shown inside button during loading for the specific provider being clicked.
- Error messages show inside a subtle error-tinted container (`bg-error/5 border border-error/20`) with text center aligned.
- Background has three decorative blurred circles (`blur-3xl`) using accent/info tokens on top of a gradient background (`from-accent-light/50 via-background to-info-light/50`).
- Footer links for Terms and Privacy Policy use accent color and point to `#` placeholders.
- Brand icon is a purple gradient rounded square at the top of the card with a person silhouette icon.

---

### LogoutButton

File: `components/layout/LogoutButton.tsx`
Last updated: 2026-06-20

| Property         | Class                                                                   |
| ---------------- | ----------------------------------------------------------------------- |
| Button           | `bg-surface border border-border px-4 py-2 rounded-md text-sm font-medium text-text-secondary hover:text-text-primary transition-colors disabled:opacity-50` |

**Pattern notes:**
- Client component — calls `signOut()` Server Action via `useTransition`.
- Used inside the async server `Navbar` component for authenticated users.
- On hover, text color shifts from `text-text-secondary` to `text-text-primary` (no background change).

---

### ProfilePage

File: `app/profile/page.tsx`
Last updated: 2026-06-20

| Property         | Class                                                                   |
| ---------------- | ----------------------------------------------------------------------- |
| Page background  | `min-h-screen bg-surface`                                               |
| Container        | `mx-auto max-w-2xl px-4 py-16`                                          |
| Card             | `rounded-2xl border border-border bg-surface p-8 shadow-card`           |
| Heading          | `text-2xl font-bold text-text-primary`                                  |
| Subtitle         | `mt-1 text-sm text-text-muted`                                          |
| Field label      | `text-xs font-medium uppercase tracking-wider text-text-muted`          |
| Field value      | `mt-1 text-text-primary`                                                |
| Field spacing    | `space-y-4`                                                             |
| Avatar           | `size-12 rounded-full`                                                  |

**Pattern notes:**
- Server component — fetches user server-side via `createInsforgeServer()`.
- Redirects to `/login` if unauthenticated or on error.
- Email field always shown; name reads from `user.metadata["full_name"]`; avatar conditionally shown only when `user.profile?.avatar_url` is set.
- Uses the standard card pattern: `bg-surface border border-border rounded-2xl p-8 shadow-card`.
