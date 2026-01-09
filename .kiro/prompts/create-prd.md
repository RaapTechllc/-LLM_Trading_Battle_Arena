# Create PRD (BattleCard Arena)

## Objective
Create or refresh the PRD so it matches the real project and stays demo-focused.

## Non-negotiables
- Paper trading only. Educational only. Not financial advice.
- Keep scope brutal. MVP first.
- No paid services required in default local mode.
- Settings must stay simple to avoid bug farms.

## Inputs
Read:
- `.kiro/steering/product.md`
- `.kiro/steering/tech.md`
- `.kiro/steering/structure.md`
- `README.md`
- `DEVLOG.md`
- any existing PRD in `docs/prd/`

## Output file
Write / update:
- `docs/prd/battlecard-arena.md`

## PRD must include
- One-liner
- Problem
- Target user
- Main outcome for the user
- Must-have differentiator: Battle Cards + Replay Audit + Fork/Rerun
- MVP features (3–5)
- Guardrails and safety language
- Battle Card schema (include `maxLossesPerDay` as a user variable)
- Core user flow (demo path)
- Acceptance criteria (testable)
- Out of scope

## Required repo updates
- If PRD changes product decisions, also update `.kiro/steering/product.md`.
- Append to `DEVLOG.md` (UTC):
  - What changed (docs)
  - What was tested (usually N/A)
  - What’s next

## Output
- File path
- Ready-to-paste markdown
- Recommended next steps (do not execute commands)
