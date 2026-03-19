# LLM Trading Battle Arena — Full Security Audit
**Auditor:** Superpowers Code Reviewer
**Date:** 2026-03-17
**Commit range:** `4e81157` → `master`
**Stack:** Next.js 15 · TypeScript · Prisma ORM · PostgreSQL · NextAuth v5 · OpenRouter API

---

## Executive Summary

The codebase is in materially better shape than the initial commit (a previous audit at `SECURITY-AUDIT.md` already fixed the most critical issues — exposed secret in git, no auth, missing indexes). Post-fix, the architecture is sound with properly implemented authentication, rate limiting, audit logging, and risk controls. This audit found **no critical issues** in the current HEAD. There are several medium and low severity items addressed below.

**Test result:** ✅ 15/15 unit tests passing
**Build status:** ✅ Clean (1 moderate npm advisory — see S5)

---

## Security Table

| ID | Severity | Category | Title | Status |
|----|----------|----------|-------|--------|
| S1-A | 🔴 CRITICAL | Secrets | Exposed API key in git history (`4e81157`) | ⚠️ NOT FIXABLE — key must be revoked |
| S1-B | 🟠 HIGH | Secrets | Revoked API key hardcoded in `SECURITY-AUDIT.md` | ✅ FIXED — redacted |
| S1-C | 🟡 MEDIUM | Secrets | `ARENA_API_TOKEN`, `NEXT_PUBLIC_BASE_URL`, OpenClaw vars missing from `.env.example` | ✅ FIXED — added |
| S2-A | 🟡 MEDIUM | Auth | `/api/showdown` (POST/GET) has no in-route auth check; relies solely on middleware | ⚠️ NOTED |
| S2-B | 🟡 MEDIUM | Auth | `/api/generate-trade` has no in-route auth check; relies solely on middleware | ⚠️ NOTED |
| S2-C | 🟡 MEDIUM | Auth | `/api/trade-cards` GET returns ALL users' trade cards (no per-user filter) | ⚠️ NOTED |
| S3-A | 🟠 HIGH | Input | `generate-trade` error message leaked raw `error.message` to client | ✅ FIXED |
| S3-B | 🟠 HIGH | Input | `live-showdown` error message leaked raw `error.message` to client | ✅ FIXED |
| S3-C | 🟠 HIGH | Input | `arena/run-round` returned `String(err)` to client | ✅ FIXED |
| S3-D | 🟡 MEDIUM | Input | `live-showdown` `currentPrice` not validated as positive finite number | ✅ FIXED |
| S3-E | 🟡 MEDIUM | Input | `trade-cards` POST: `direction` and `rarity` not validated against enums | ✅ FIXED |
| S4-A | 🟡 MEDIUM | Network | CSP `unsafe-eval` applied in ALL environments (not just dev) | ⚠️ NOTED |
| S5-A | 🟡 MEDIUM | Deps | `next@15.5.x` has 1 moderate CVE (GHSA-3x4c-7xq6-9pq8: unbounded image disk cache) | ⚠️ Fix requires breaking change to next@16 |
| S5-B | 🟡 MEDIUM | Deps | `next-auth@5.0.0-beta.30` is pre-release software in production | ⚠️ NOTED |
| S6-A | 🟡 MEDIUM | Privilege | `/api/auto-trade` has no rate limiting (only auth) — can spam DB | ⚠️ NOTED |
| S7-A | 🟢 LOW | Logging | `TradingService.syncPositions` logs userId to stdout | ⚠️ BENIGN |
| S7-B | 🟢 LOW | Logging | `AuditLogger` failure logs full `entry.details` including trade params | ⚠️ SERVER-SIDE ONLY |

---

## S1 — Secrets

### S1-A: Exposed API key in git history (NOT FIXABLE)
**Commit `4e81157`** contains `.env.local` with a real OpenRouter API key. The file was removed in `484498a` and is in `.gitignore`, but the key lives in git history permanently.

**Action required by Kyle:**
1. Verify the key `sk-or-v1-c872b...` (see `4e81157`) has been revoked at https://openrouter.ai/settings/keys
2. To clean history: `git filter-repo --path .env.local --invert-paths` (destructive — coordinate with team)

**Current state:** `.env.example` is correct (placeholder values only). No hardcoded secrets in `src/`.

### S1-B: API key text in SECURITY-AUDIT.md
The previous audit wrote the full key into `SECURITY-AUDIT.md:18` as a finding. **Fixed** — key redacted in this audit.

### S1-C: Missing env vars in .env.example
`ARENA_API_TOKEN`, `NEXT_PUBLIC_BASE_URL`, `OPENCLAW_GATEWAY_URL`, `OPENCLAW_GATEWAY_TOKEN` were used in source code but undocumented. **Fixed** — added to `.env.example`.

---

## S2 — Authentication

**Positive:**
- NextAuth v5 with database sessions (24h TTL) — solid foundation
- OAuth-only (GitHub + Google) — no password storage risk
- `middleware.ts` correctly protects all non-public routes
- `getServerSession()` used consistently in all financial routes (`/api/account/balance`, `/api/auto-trade`, `/api/live-showdown`, `/api/trades/batch`, `/api/trade-cards` POST)
- Arena routes protected by `ARENA_API_TOKEN` bearer token — separate auth layer for internal API

**Issues:**

### S2-A / S2-B: Defense-in-depth gap
`/api/showdown` (POST and GET) and `/api/generate-trade` (POST) have no in-route auth check. They are protected by `middleware.ts` via redirect, but:
- A middleware bypass would leave these routes fully open
- API clients receive a 302 redirect (HTML) rather than a JSON `401` — breaks client error handling

**Recommendation:** Add `getServerSession()` + early return `401` in each route handler.

### S2-C: Trade cards readable by all authenticated users
`GET /api/trade-cards` returns all trade cards across all users. For a paper-trading educational app this may be intentional, but it leaks which assets and positions other users have traded.

**Recommendation:** Add `userId: session.user.id` filter to the query, or explicitly document that card data is intentionally public.

---

## S3 — Input Validation

**Positive:**
- Prisma ORM throughout — no raw SQL, no injection risk
- `reasoning` field sanitized (HTML stripped, length capped at 200 chars)
- Numeric fields validated in `trade-cards` POST
- `MODEL_MAP` whitelist in `generate-trade` and `trades/batch`
- `parseDecision()` in `arena-orchestrator.ts` defensively clamps all LLM output

**Issues fixed in this audit:**

### S3-A/B/C: Internal error messages leaked to clients
Three routes returned raw error messages (including config details and internal stack info) to API consumers. Fixed to return generic messages, with full errors logged server-side.

### S3-D: `currentPrice` in `live-showdown` not range-validated
A zero or negative price would produce NaN/Infinity P&L values and corrupt DB records. **Fixed** — `Number.isFinite(currentPrice) && currentPrice > 0` guard added.

### S3-E: Enum fields unvalidated in `trade-cards` POST
`direction` accepted any string (could store arbitrary values like `"SIDEWAYS"`). `rarity` similarly unvalidated. **Fixed** — validated against `LONG|SHORT` and `COMMON|RARE|EPIC|LEGENDARY`.

---

## S4 — Network Security

**Positive:**
- HSTS with 1-year max-age + includeSubDomains ✅
- X-Content-Type-Options: nosniff ✅
- X-Frame-Options: DENY + `frame-ancestors 'none'` ✅
- Referrer-Policy: strict-origin-when-cross-origin ✅
- CSP: configured ✅
- No CORS — correctly same-origin only ✅
- External fetches (CoinGecko, HyperLiquid, OpenRouter) use `AbortSignal.timeout()` ✅

### S4-A: CSP `unsafe-eval` in production
`next.config.js` includes `'unsafe-eval'` in `script-src` with the comment "needed by Next.js dev". In production builds Next.js does NOT need `unsafe-eval`. This weakens XSS protection in production.

**Recommendation:**
```javascript
"script-src 'self' 'unsafe-inline'" +
  (process.env.NODE_ENV === 'development' ? " 'unsafe-eval'" : "")
```

---

## S5 — Dependencies

```
npm audit: 1 moderate vulnerability
next  10.0.0 - 16.1.6
GHSA-3x4c-7xq6-9pq8: Unbounded next/image disk cache growth can exhaust storage
Fix: next@16.1.7 (breaking change)
```

**Action:** Evaluate upgrade to Next.js 16.x on next planned major update. Low urgency unless `next/image` is used heavily (the app doesn't appear to use it extensively).

`next-auth@5.0.0-beta.30` — pre-release software. Auth v5 has been in beta for an extended period and is widely deployed, but be prepared for breaking changes on upgrade. Monitor https://authjs.dev for stable release.

---

## S6 — Privilege & Access Control

**Positive:**
- `TradingService.closePosition()` explicitly checks `position.userId !== userId` before allowing close ✅
- `account/balance` route only reads own user's balance via `session.user.id` ✅
- `auto-trade` requires authentication ✅
- Arena run-round and trading-mode endpoints protected by `ARENA_API_TOKEN` ✅
- `liveApproved` flag requires manual approval before agent can go live ✅

### S6-A: `/api/auto-trade` lacks rate limiting
This endpoint makes N OpenRouter API calls (one per model, currently 5) and writes N DB records per invocation. An authenticated user can hammer it without limit. Cost impact: ~5 LLM API calls × cost per call per request.

**Recommendation:** Add `rateLimitAsync(ip)` (same pattern as `generate-trade`) at the top of the route handler.

---

## S7 — Logging

**Positive:**
- `AuditLogger` is centralized and append-only ✅
- Email PII explicitly excluded from audit logs (comment in `auth.ts`) ✅
- Risk events logged to `RiskEvent` table ✅
- Detailed errors logged server-side (console.error) in all catch blocks ✅

### S7-A: `syncPositions` logs userId to stdout
`console.log(\`[TradingService] syncPositions stub called for user ${userId}\`)` — benign in isolation, but user IDs in logs can help enumerate active users. Low priority.

### S7-B: AuditLogger failure reveals trade details to stderr
When `prisma.auditLog.create` fails, the full `entry` object (including trade `params` with symbol, quantity, price) goes to `console.error`. This is server-side only and acceptable, but should be reviewed if logs are shipped to external logging services.

---

## Architecture Review

### Strengths
- Clear service layer: `TradingService`, `RiskManager`, `AuditLogger`, `PaperTradingService`, `LiveTradingGate`
- Risk controls implemented at the correct abstraction level (service, not route)
- Kill switch pattern (`ARENA_KILL_SWITCH` env + `haltedUntil` per-agent) is solid
- Trusted envelope pattern in `arena-orchestrator.ts` guards against prompt injection from market data
- Session keys never in DB (read from `~/.secrets/arena/`) — TopG security design ✅
- Prisma ORM throughout — no raw SQL
- Paper trading with real prices, slippage simulation, stop/take-profit enforcement

### Issues

#### ARCH-1: Dockerfile doesn't provision `~/.secrets/arena/`
`arena-orchestrator.ts` reads session keys from `$HOME/.secrets/arena/<tag>.key`. The Dockerfile creates a `nextjs` user but doesn't create this directory. Result: all agents fall back to direct API path (which is fine functionally, but the OpenClaw path is silently unavailable in the container).

**Recommendation:** Add `RUN mkdir -p /home/nextjs/.secrets/arena && chown nextjs:nodejs /home/nextjs/.secrets/arena` to Dockerfile, or document that session key mounting is required.

#### ARCH-2: `add-favorites-column.sql` in repo root
Raw SQL migration file not tracked by Prisma. Either apply it as a Prisma migration or delete it. As-is it causes schema drift confusion.

#### ARCH-3: `auto-trade` calls its own HTTP API
`fetch(\`${NEXT_PUBLIC_BASE_URL}/api/market/live-prices\`)` is an HTTP round-trip to self. This works but is fragile in Docker (hostname resolution), slow vs. a direct function call, and requires `NEXT_PUBLIC_BASE_URL` to be set correctly. Import and call the fetch logic directly.

#### ARCH-4: `rateLimit` (sync) is dead code
`export function rateLimit()` in `rate-limit.ts` is unused — all call sites use `rateLimitAsync`. Safe to delete.

#### ARCH-5: `getSessionIdFromRequest` generates ephemeral UUID on miss
If no `arena_session_id` cookie is present, `getSessionIdFromRequest()` returns a new UUID but never persists it. Callers that rely on it for data ownership get a phantom ID on every un-cookied request. This function appears unused now that NextAuth is in place — confirm and remove.

---

## Tests

```
PASS tests/unit/code-review-fixes.test.ts
PASS tests/unit/analytics-streak.test.ts
PASS tests/unit/agent-config-validation.test.ts

Test Suites: 3 passed, 3 total
Tests:       15 passed, 15 total
Time:        1.454s
```

**Coverage gaps:**
- No tests for API route handlers (auth checks, validation, error responses)
- No tests for `RiskManager`, `TradingService`, `AuditLogger`, `LiveTradingGate`
- No tests for `arena-orchestrator.ts` (most complex file)
- E2E tests exist but not run in this audit (require live server)

---

## Fixes Applied in This Audit

| File | Change |
|------|--------|
| `SECURITY-AUDIT.md` | Redacted hardcoded API key |
| `.env.example` | Added `ARENA_API_TOKEN`, `ARENA_KILL_SWITCH`, `NEXT_PUBLIC_BASE_URL`, OpenClaw vars |
| `src/app/api/arena/run-round/route.ts` | `String(err)` → generic error + server log |
| `src/app/api/live-showdown/route.ts` | Raw `error.message` → generic error + `currentPrice` range validation |
| `src/app/api/generate-trade/route.ts` | Raw `error.message` → generic error (config vs. runtime distinction preserved) |
| `src/app/api/trade-cards/route.ts` | Added `direction` and `rarity` enum validation |

---

## Remaining Issues (Require Manual Action)

| Priority | Action |
|----------|--------|
| 🔴 IMMEDIATE | Verify `sk-or-v1-c872b8b...` key (git history) is revoked at openrouter.ai |
| 🟠 HIGH | Add in-route auth to `/api/showdown` (both methods) and `/api/generate-trade` |
| 🟡 MEDIUM | Add `rateLimitAsync` to `/api/auto-trade` |
| 🟡 MEDIUM | Add per-user filter OR document as public on `GET /api/trade-cards` |
| 🟡 MEDIUM | Fix CSP `unsafe-eval` to development-only |
| 🟡 MEDIUM | Evaluate Next.js 16 upgrade for moderate CVE fix |
| 🟢 LOW | Fix Dockerfile to provision `~/.secrets/arena/` directory |
| 🟢 LOW | Delete `add-favorites-column.sql` or migrate into Prisma |
| 🟢 LOW | Remove dead `rateLimit` (sync) export from `rate-limit.ts` |
| 🟢 LOW | Replace self-HTTP-call in `auto-trade` with direct function import |

---

## Verdict

**CONDITIONALLY APPROVED for paper-trading production use.**

The core security posture — authentication, authorization on financial endpoints, audit logging, risk controls, no SQL injection, CSP/security headers — is solid. The remaining issues are defense-in-depth improvements and low-risk in the paper-trading educational context. The critical blocker is confirming the leaked API key from git history has been revoked. No real money is at risk (PAPER_TRADING_MODE enforced). Do not enable `LIVE` trading mode until all HIGH items are resolved.
