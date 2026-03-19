# Kiro CLI Quick Start Wizard (BattleCard Arena)

## Welcome
This wizard bootstraps a **hackathon-ready** repo for BattleCard Trading Arena.

Goal:
- Mock-first local mode works with zero external keys.
- Deployable path exists (Vercel + Neon).
- Docs and prompts exist from day one.
- Playwright protects the demo path.

## What I will create or verify
- `.kiro/steering/*`
- `.kiro/prompts/*`
- `docs/prd/*`, `docs/plans/*`, `docs/demo-script.md`, `docs/test-plan.md`
- `DEVLOG.md`, `README.md`
- Next.js app scaffold
- Prisma + SQLite default
- Playwright set up + golden path skeleton test

## Step 1 — Gather inputs (keep it simple)
Ask only:
1) Project name (default: battlecard-arena)
2) Confirm stack (Next.js App Router + Tailwind + Prisma + Playwright)
3) Confirm DB mode (SQLite local, Neon optional in prod)

## Step 2 — Repository hygiene check
**CRITICAL**: Before scaffolding, verify:
1. `.gitignore` exists with these entries:
   - `/node_modules`
   - `/.next/`
   - `.env*.local`
   - `/coverage`
   - `*.tsbuildinfo`
2. If `.gitignore` is missing, CREATE IT FIRST before any other commands
3. If `node_modules/` is already committed, STOP and warn user

## Step 3 — Scaffold commands (output exact commands)
Provide the exact commands to run, in order.
Use safe defaults:
- pnpm
- Next.js with TS + Tailwind
- Prisma init
- Playwright init

## Step 4 — Write baseline docs (repo artifacts)
Ensure these exist with project-specific content:
- `.kiro/steering/product.md`
- `.kiro/steering/tech.md`
- `.kiro/steering/structure.md`
- `docs/prd/battlecard-arena.md`
- `docs/plans/mvp-implementation.md`
- `docs/demo-script.md`
- `docs/test-plan.md`
- `DEVLOG.md` (first entry, UTC)
- `README.md` (setup + run + env + deploy + demo)

## Step 5 — Minimal working demo (Slice 0)
Create a minimal UI route that:
- renders disclaimers (paper trading only, educational only, not financial advice)
- shows a “Create Battle Card” CTA (can be stub)
- runs without any env vars beyond DATABASE_URL default

## Step 6 — Add Playwright guardrail now
Create a Playwright test that:
- opens home page
- verifies disclaimer text is visible
- clicks through the primary CTA path (even if stubbed)

## Output
- A checklist of what was created
- Any missing items
- The next command to run

## Required doc update
Append a DEVLOG.md entry (UTC) describing what was scaffolded and what was tested.
Update README.md if commands differ from typical defaults.
