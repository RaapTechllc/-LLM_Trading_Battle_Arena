# BattleCard Arena — Kiro Prompt Pack

These prompts are tuned for this repo.

Core loop (repeat per feature):
1. `@prime` — load context (no code)
2. `@plan-feature <feature>` — write a plan (no code)
3. `@execute <plan>` — implement in vertical slices
4. `@code-review` — quality review
5. `@system-review` — compare plan vs reality
6. `@code-review-hackathon` — score for submission readiness

Extra:
- `@quickstart` — bootstrap a fresh repo setup
- `@create-prd` — generate / refresh PRD
- `@execution-report` — summarize an implementation session
- `@rca` + `@implement-fix` — analyze and fix bugs

House rules:
- Paper trading only. Educational only. Not financial advice.
- Default mode must run with **zero external keys**.
- Every slice adds or updates **Playwright** tests for the demo path.
- Every prompt that changes the repo must update:
  - `DEVLOG.md` (append, UTC timestamp)
  - `README.md` (only if setup/run/env/deploy changed)

Self-improving system:
- If you notice repeated friction, update the relevant prompt in `.kiro/prompts/`
  and log the change in `DEVLOG.md`.
