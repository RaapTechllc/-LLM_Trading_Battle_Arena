Locked. We’ll keep **daily stop-loss** simple.

* **`maxLossesPerDay` (number)** set by user.
* No “in-a-row” logic in MVP. Too bug-prone.
* If someone wants “stop after 1 loss”, they set `maxLossesPerDay = 1`.

Below are **updated versions of the existing Kiro Hackathon prompts** tuned for this project, with:

* **Mock-first default**
* **Playwright enforced every slice**
* **Auto DEVLOG + README updates**
* **Self-improving prompts** (they patch themselves when they learn)

---

## 1) Updated prompt files (ready to paste)

### `.kiro/prompts/prime.md`

````md
---
description: "Prime: load BattleCard Arena context fast and safely"
---

# @prime — Load Project Context (BattleCard Arena)

## Goal
Get a correct, current picture of the repo in <5 minutes.
Do not code. Do not refactor.

## Read first (in this order)
1) `.kiro/steering/product.md`
2) `.kiro/steering/tech.md`
3) `.kiro/steering/structure.md`
4) `/docs/prd/*` (pick the main PRD)
5) `/docs/plans/mvp-implementation.md`
6) `/docs/demo-script.md`
7) `/docs/test-plan.md`
8) `README.md`
9) `DEVLOG.md`

## Inspect repo state (if git)
```bash
git status
git log -10 --oneline
````

## Inspect build + test surface

Read:

* `package.json` (scripts)
* `next.config.*` (if exists)
* `playwright.config.*` and `tests/e2e/**` (if exists)
* `prisma/schema.prisma` and migration status (if exists)

## Output (write nothing, just report)

### Context Snapshot

* What the app is (1–2 sentences)
* Current demo path (from docs) and whether code supports it
* Data mode: mock-first status (yes/no)
* LLM mode: mock-first status (yes/no)
* DB mode: SQLite local / Neon deploy readiness (yes/no)
* Playwright status: installed? has a “golden path” test? (yes/no)

### Risks (top 5)

Only real blockers.

### Next Best Action

One specific next command to run (usually @plan-feature or @execute).

## Self-improve rule

If you had to look at an important file not listed above,
update this prompt file to include it.
Add a DEVLOG note: “prime prompt improved”.

````

---

### `.kiro/prompts/plan-feature.md`
```md
---
description: "Plan a feature in vertical slices with Playwright-first validation"
argument-hint: "[feature-name]"
---

# @plan-feature — Plan: $ARGUMENTS

## Rules
- No coding in this step.
- No web browsing.
- Keep scope brutal. Ship fast.
- Every slice must keep the demo path working.
- Every slice must include a Playwright check.

## Inputs you MUST read
- `.kiro/steering/*`
- `/docs/prd/*` (main PRD)
- `/docs/plans/mvp-implementation.md`
- `README.md`
- Current code around the area you will touch

## Output file
Create: `/docs/plans/$ARGUMENTS.md`

## Plan format (use this exact structure)

# Feature Plan: <feature-name>

## Why
1 paragraph. Tie to PRD + demo.

## User Story
As a <user>
I want <thing>
So that <outcome>

## Acceptance Criteria (tight)
- [ ] Observable UI/behavior result
- [ ] Data persistence rules (if any)
- [ ] Error states (at least 2)
- [ ] Playwright “golden path” updated and passing
- [ ] README updated if scripts/env/demo changed
- [ ] DEVLOG entry added for this plan

## Scope Guardrails
In-scope (3–7 bullets)
Out-of-scope (3–7 bullets)

## Files likely touched
Bullet list. Include tests.

## Vertical Slices
Each slice must include:
- Build steps (short)
- Tests (unit + Playwright)
- Validation commands

### Slice 1 — <name>
Build:
- ...
Tests:
- Unit:
- Playwright:
Validate:
```bash
pnpm lint
pnpm test:e2e
````

### Slice 2 — <name>

...

## Playwright strategy (mandatory)

* Maintain ONE growing test: `tests/e2e/golden-path.spec.ts`
* Each slice extends the test only as far as the feature exists.
* If UI isn’t ready, test the simplest stable selector.

## Notes / Decisions

Include key tradeoffs.

## After writing the plan

1. Update `/docs/plans/mvp-implementation.md` if priorities changed.
2. Append DEVLOG entry (planning).
3. If README will change later, add a TODO line in README under a “Planned changes” note.

## Self-improve rule

If you realized this plan template is missing a section that would prevent bugs,
patch this prompt file and log it in DEVLOG.

````

---

### `.kiro/prompts/execute.md`
```md
---
description: "Execute a plan in slices with strict validation and doc sync"
argument-hint: "[path-to-plan]"
---

# @execute — Run Plan: $ARGUMENTS

## Rules
- Implement slice-by-slice.
- After EACH slice: tests + docs sync.
- Default mode must stay mock-first.
- Never break the demo path.

## Step 0 — Load context
- Run @prime mentally: read steering + PRD + plan.
- Confirm what “done” means (acceptance criteria).

## Step 1 — Execute slices
For each slice in the plan:

### A) Do the build steps
- Small commits in your head. Small changes.
- Mirror existing patterns.

### B) Update tests immediately
- Update unit tests (if any).
- Update Playwright golden path:
  `tests/e2e/golden-path.spec.ts`

### C) Validate (MANDATORY)
Run exactly:
```bash
pnpm lint
pnpm test
pnpm test:e2e
````

If any fail:

* Fix before moving on.

### D) Doc sync after slice (MANDATORY)

* Append DEVLOG entry:

  * UTC timestamp
  * 3–7 bullets “What changed”
  * “What was tested” (include Playwright)
  * 1–3 bullets “What’s next”
* Update README if:

  * scripts changed
  * env vars changed
  * setup steps changed
  * demo path changed

### E) Mark slice done

Update the plan file with a ✅ next to the slice header.

## Step 2 — Final pass

* Re-run:

```bash
pnpm lint
pnpm test
pnpm test:e2e
pnpm build
```

## Output report (write to file)

Create: `.kiro/reports/execution/<timestamp>-<feature>.md`

Include:

* Plan path
* Files changed
* Validation command results (pass/fail)
* Demo path verification steps

## Self-improve rule

If you had to invent a process step to stay safe,
patch this prompt file and log it in DEVLOG.

````

---

### `.kiro/prompts/quickstart.md`
```md
---
description: "Quickstart wizard for BattleCard Arena (Next.js + Prisma + Playwright)"
---

# @quickstart — BattleCard Arena Setup Wizard

## Goal
Make the repo runnable locally with:
- Next.js app
- Prisma (SQLite local)
- Playwright E2E baseline
- Docs + .kiro in place

## Step 1 — Verify required docs exist
Confirm these exist. Create if missing.
- `.kiro/steering/product.md`
- `.kiro/steering/tech.md`
- `.kiro/steering/structure.md`
- `/docs/prd/*`
- `/docs/plans/mvp-implementation.md`
- `/docs/demo-script.md`
- `/docs/test-plan.md`
- `README.md`
- `DEVLOG.md`

## Step 2 — Install baseline deps
Ensure package scripts exist for:
- `lint`
- `test`
- `test:e2e`
- `build`

Install:
- prisma + @prisma/client
- playwright

## Step 3 — Prisma local DB (SQLite)
- Add `DATABASE_URL="file:./dev.db"` to `.env.local`
- Create `prisma/schema.prisma`
- Run:
```bash
pnpm prisma generate
pnpm prisma db push
````

## Step 4 — Playwright baseline

* Initialize Playwright if needed
* Create `tests/e2e/golden-path.spec.ts` with the simplest “home loads” test
* Add `pnpm test:e2e` script to run Playwright

## Step 5 — Minimum UI skeleton

* Home page with:

  * Project name
  * “Paper trading only. Educational only. Not financial advice.”
  * A clear “Create Battle Card” CTA (even if stub)

## Step 6 — Validate

Run:

```bash
pnpm lint
pnpm test
pnpm test:e2e
pnpm dev
```

## Step 7 — Docs sync (MANDATORY)

* DEVLOG entry for quickstart
* README updated to match real setup steps

## Self-improve rule

If you discovered a missing setup step,
patch this prompt file and log it in DEVLOG.

````

---

### `.kiro/prompts/code-review.md`
```md
---
description: "Technical code review focused on correctness + demo safety"
---

# @code-review — Technical Review

## Scope
Review recent changes on this branch.

## Gather context
Read:
- `.kiro/steering/*`
- PRD in `/docs/prd/*`
- `README.md`
- `DEVLOG.md`

Then:
```bash
git status
git diff --stat HEAD
git diff HEAD
git ls-files --others --exclude-standard
````

## Review checklist (prioritize bugs)

### Correctness

* Risk rules enforced server-side (not only UI)
* Deterministic runs (seed stored)
* No silent failures

### Safety + Claims (MUST)

* UI + README must NOT imply “won’t lose money”
* Must say paper trading only + educational only

### Architecture

* Domain logic stays out of UI components
* Engine functions are testable

### Testing

* Slice changes reflected in unit tests (when relevant)
* Playwright golden path updated
* No flaky selectors

## Output file

Create: `.kiro/reviews/tech/<timestamp>.md`

Include:

* Files reviewed
* Issues list with severity: critical/high/medium/low
* Exact file paths + line numbers
* Fix suggestions
* “Confidence: X/10”

## DEVLOG

Append a short DEVLOG entry:

* “Ran code review”
* “What was tested” (what you ran or inspected)

## Self-improve rule

If this review missed a common failure mode,
patch this prompt file and log it in DEVLOG.

````

---

### `.kiro/prompts/code-review-hackathon.md`
```md
---
description: "Hackathon rubric scoring + fastest fixes to raise score"
---

# @code-review-hackathon — Submission Score Review

## Goal
Score the repo against the rubric.
Find the fastest changes that raise points.

## Inspect
- `.kiro/steering/*`
- `.kiro/prompts/*`
- `README.md`
- `DEVLOG.md`
- `/docs/prd/*`
- `/docs/plans/*`
- `/docs/demo-script.md`
- `/docs/test-plan.md`

Repo scan:
```bash
ls -la
tree -L 3 -I 'node_modules|.git|dist|build' || true
````

## Rubric scoring (100)

* Application Quality (40)
* Kiro CLI Usage (20)
* Documentation (20)
* Innovation (15)
* Presentation (5)

## Output file

Create: `.kiro/reviews/hackathon/<timestamp>.md`

Include:

1. Score breakdown with evidence links (file paths)
2. Top 10 changes ranked by “points gained per hour”
3. Submission readiness checklist:

   * public repo
   * .kiro complete
   * README setup + deploy
   * demo script exists
   * demo path works
4. Demo risk list (top 5 things that could break video)

## DEVLOG

Append: “Hackathon score review run” + top next actions.

## Self-improve rule

If you repeatedly see the same missing artifact,
update the quickstart prompt to create it by default.

````

---

### `.kiro/prompts/code-review-fix.md`
```md
---
description: "Fix issues found in a code review, with tests and doc sync"
argument-hint: "[path-to-review-file]"
---

# @code-review-fix — Fix Review Issues

## Input
Review file: $ARGUMENTS

## Steps
1) Read the review file fully.
2) Sort issues by severity (critical → low).
3) Fix one issue at a time.
4) After each fix:
   - update/extend unit tests if relevant
   - update Playwright golden path if flow changed
   - run validations

## Mandatory validation after each batch
```bash
pnpm lint
pnpm test
pnpm test:e2e
````

## Docs sync (mandatory)

* DEVLOG entry: what fixed, what tested, what next
* README updated if setup/env/scripts changed

## Output file

Create: `.kiro/reports/fixes/<timestamp>.md`
Include:

* Issues fixed (by ID from review)
* Files changed
* Commands run

## Self-improve rule

If fixes were hard because the plan style was vague,
update @plan-feature template and log it in DEVLOG.

````

---

### `.kiro/prompts/system-review.md`
```md
---
description: "Process review: plan vs execute, plus prompt improvements"
argument-hint: "[plan-path] [execution-report-path]"
---

# @system-review — Plan vs Reality

## Inputs
- Plan: $ARGUMENTS (first path)
- Execution report: $ARGUMENTS (second path)

## Goal
Find process problems and fix the system.
This is not a bug hunt.

## Steps
1) Read plan and extract promised outcomes + validations.
2) Read execution report and extract what actually happened.
3) List divergences:
   - Good divergence (better)
   - Bad divergence (risky)

## Output file
Create: `.kiro/reviews/system/<timestamp>.md`

Include:
- Alignment score (0–10)
- Divergences table
- Root causes
- 3–7 concrete system changes

## Mandatory system changes (self-improving)
If you find missing steps in prompts:
- Patch the relevant file in `.kiro/prompts/*`
- Append DEVLOG entry: “prompt improved: <name>”
````

---

### `.kiro/prompts/create-prd.md`

```md
---
description: "Generate/refresh PRD for BattleCard Arena and keep docs consistent"
argument-hint: "[output-path]"
---

# @create-prd — Write PRD

## Output
Write PRD to: $ARGUMENTS
Default: `/docs/prd/battlecard-arena.md`

## Must include (project-specific)
- Paper trading only
- Educational only
- Not financial advice
- Battle Cards + Replay Audit differentiator
- Risk control includes `maxLossesPerDay` (user-set number)

## Also update (if needed)
- `.kiro/steering/product.md` to match PRD
- `README.md` to match reality
- `DEVLOG.md` entry: “PRD updated”

## Keep it scannable
Short sections. Tight scope. No fantasy features.
```

---

### `.kiro/prompts/execution-report.md`

```md
---
description: "Write an execution report after implementing a feature"
argument-hint: "[plan-path]"
---

# @execution-report — Implementation Report

## Input
Plan path: $ARGUMENTS

## Output file
Create: `.kiro/reports/execution/<timestamp>.md`

Include:
- Plan path
- What shipped (bullets)
- What changed (files)
- What was tested:
  - pnpm lint
  - pnpm test
  - pnpm test:e2e
  - pnpm build
- Divergences from plan (if any)
- Follow-ups (1–3)

## Docs sync
Append DEVLOG entry: “execution report created”.
```

---

### `.kiro/prompts/rca.md`

```md
---
description: "Root cause analysis for a bug or failure (not just GitHub issues)"
argument-hint: "[bug-title-or-issue-id]"
---

# @rca — Root Cause Analysis: $ARGUMENTS

## Goal
Turn a bug into a reproducible case + fix plan.

## Output
Create: `/docs/rca/$ARGUMENTS.md` (slug if needed)

## Required sections
- Summary
- Impact
- Reproduction steps (exact)
- Expected vs actual
- Root cause (with file paths)
- Fix plan (smallest safe change)
- Prevent regression:
  - Add/extend unit test (if relevant)
  - Add/extend Playwright golden path step (if user flow)

## Docs sync
Append DEVLOG entry: “RCA created”.
```

---

### `.kiro/prompts/implement-fix.md`

````md
---
description: "Implement a fix from an RCA with tests + doc sync"
argument-hint: "[path-to-rca]"
---

# @implement-fix — Implement RCA Fix

## Input
RCA path: $ARGUMENTS

## Steps
1) Read RCA fully.
2) Reproduce the issue (as described).
3) Implement the smallest safe fix.
4) Add regression protection:
   - unit tests if logic-level
   - Playwright golden path if user-level

## Mandatory validation
```bash
pnpm lint
pnpm test
pnpm test:e2e
pnpm build
````

## Output

Create: `.kiro/reports/fixes/<timestamp>.md`
Include:

* RCA referenced
* What changed
* Commands run
* Confirmation reproduction no longer happens

## Docs sync

* DEVLOG entry
* README update if behavior/setup changed

## Self-improve rule

If the RCA template missed info you needed,
patch @rca and log it in DEVLOG.

````

---

## 2) How you run this as a beginner (simple loop)

**Daily loop**
1) `@prime`
2) `@plan-feature battle-card-builder` (or whatever slice)
3) `@execute docs/plans/battle-card-builder.md`
4) `@code-review`
5) `@code-review-fix .kiro/reviews/tech/<latest>.md` (if needed)
6) `@execution-report docs/plans/battle-card-builder.md`
7) `@code-review-hackathon` (every 2–3 days)

This keeps you submission-ready.

---

## Next command to run
After you paste these files into `.kiro/prompts/`:

```text
@quickstart
````
