---
description: "Implement fixes from a code review or hackathon review, with tests and doc sync"
---

# Code Review Fix

## Input: $ARGUMENTS
Use one of:
- a markdown file path containing findings
- a short list of issues pasted into the prompt

## Mission
Fix issues fast without breaking the demo path.

## Non-negotiables
- Fix one finding at a time.
- Add or update a test for each fix.
- Verify build still works: `npm run build`
- Update DEVLOG.md after the fix set.
- Update README.md only if setup/run/env/deploy changed.

## Process
1) Parse the findings and rank:
- P0: breaks demo / data corruption / security risk
- P1: correctness bugs / flaky tests
- P2: cleanup

2) For each fix:
- identify root cause in code
- implement minimal patch
- add tests (unit or Playwright)
- run quick validation (build/type check only)

3) Doc sync:
- DEVLOG entry (UTC, what changed / what tested / what next)
- README update if needed

## Output
- Fixes applied (bullets)
- Validation run (build/type check results only)
- Any remaining risks
- Recommended next steps (do not execute long-running tests)

## Prompt Improvements (required when useful)
If the review revealed a predictable gap (missing test type, missing doc step),
patch the relevant prompt in `.kiro/prompts/` and log it.
