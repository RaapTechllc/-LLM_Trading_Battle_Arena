# Code Review (Quality + Bugs)

## Purpose
Find real issues that impact:
- correctness
- reliability
- security
- maintainability
- demo stability

This repo is a hackathon build.
Prefer high-signal fixes that prevent broken flows.

## Non-negotiables
- Do not invent issues. Verify in code.
- If you propose a fix, also propose a test.
- Respect project constraints:
  - paper trading only
  - mock-first local mode
  - deterministic runs
  - clear disclaimers
  - Playwright protects demo path

## What to review
### Product and UX
- Demo path is clear and unbroken
- Errors are user-friendly
- Disclaimers are visible in UI and README

### Engine correctness
- Determinism: seed is stored and used
- Guardrails enforced server-side:
  - maxTradesTotal
  - maxTradesPerDay
  - maxLossesPerDay (user variable)
  - session windows
- Ledger is append-only and replayable

### Data + API
- Prisma queries safe and scoped
- Server actions validate inputs
- No secrets required for default mode

### Code health
- Type safety
- Dead code
- Unhandled errors
- Logging that helps debug

### Testing
- Playwright covers golden path
- Unit tests cover rule edge cases
- Tests run fast and are stable
- **Test/route alignment**: Verify Playwright tests reference routes that exist in `src/app/`

## Output format
1) Summary
- Overall health (1–2 paragraphs)
- Demo risk level (low/med/high)

2) Findings (table)
For each finding:
- Severity (P0/P1/P2)
- What breaks
- Where (file paths)
- Evidence (what you observed)
- Fix (concrete steps)
- Test to add/update (unit or Playwright)

3) Quick wins (top 3)
4) Recommended validation (do not execute):
   - Build check: `npm run build`
   - Type check: `npx tsc --noEmit`
   - Lint check: `npm run lint`

## Prompt Improvements (optional)
If you notice recurring misses (docs drift, missing tests, etc.),
recommend a small edit to a prompt in `.kiro/prompts/`.
