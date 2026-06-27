# Security Decisions

## npm audit Moderate Vulnerabilities (2026-06-26)

### Finding
`npm audit` reports 2 moderate vulnerabilities:
1. `postcss <8.5.10` - XSS via Unescaped `</style>` in CSS Stringify Output (GHSA-qx2v-qp2m-jg93)
2. `@ai-sdk/provider-utils <=3.0.97` - Uncontrolled Resource Consumption (GHSA-866g-f22w-33x8)

### Impact Assessment
- **postcss**: This is a transitive dependency of Next.js 16.2.9. The fix would require downgrading Next.js to 9.3.3 (breaking change). The vulnerability is in the CSS stringifier and requires specific conditions to exploit. Not directly reachable in our application code paths.
- **@ai-sdk/provider-utils**: This is a transitive dependency of `@browserbasehq/stagehand@^3.6.0`. The fix would require downgrading Stagehand to 2.1.0 (breaking change, major version). The vulnerability is in the AI SDK provider utilities and requires specific conditions to exploit.

### Decision
**Defer fix** - Both vulnerabilities are in transitive dependencies of critical frameworks (Next.js, Stagehand) where upgrading/downgrading would introduce breaking changes and delay the launch. The vulnerabilities are:
- Not directly reachable in our application code
- Low exploitability in our deployment context (server-side only, no user-controlled CSS input)
- Will be resolved when Next.js and Stagehand release patched versions

### Review Date
Review by 2026-07-26 (30 days). Check for updated versions of Next.js and Stagehand that include the fixes.

### Mitigations in Place
- Security headers configured (X-Content-Type-Options: nosniff, CSP)
- No user-controlled input passed to CSS processors
- AI SDK usage is server-side only with controlled prompts
- Rate limiting on auth endpoints
- All user input validated at boundaries with Zod schemas

---

## Security Headers (2026-06-26)

Added via next.config.ts:
- X-DNS-Prefetch-Control: on
- X-Content-Type-Options: nosniff
- X-Frame-Options: DENY
- X-XSS-Protection: 1; mode=block
- Referrer-Policy: strict-origin-when-cross-origin
- Permissions-Policy: camera=(), microphone=(), geolocation=()

## Rate Limiting (2026-06-26)

Added in-memory rate limiter (`lib/rate-limiter.ts`) applied to:
- `/api/auth/callback` - 10 requests per 15 minutes per IP

## Health Check Endpoint (2026-06-26)

Added `/api/health` endpoint returning `{ status: "ok", timestamp }` for infrastructure monitoring.