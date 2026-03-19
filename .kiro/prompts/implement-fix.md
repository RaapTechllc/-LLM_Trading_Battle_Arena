# Implement Fix: Issue $ARGUMENTS

## Objective
Implement the fix described in the RCA doc:
`docs/rca/issue-$ARGUMENTS.md`

## Non-negotiables
- Keep changes minimal.
- Add or update tests so the bug cannot return.
- Run Playwright if the bug touches the UI or demo path.
- Update DEVLOG.md (UTC) after fixes.
- Update README.md only if setup/run/env/deploy changed.

## Process

### 1) Load RCA
Read:
- `docs/rca/issue-$ARGUMENTS.md`
- related code and tests

### 2) Implement the fix
- patch the smallest surface area
- avoid adding new settings unless required

### 3) Add/Update tests (required)
- unit tests for rule logic
- Playwright spec for the reproduced UI path

### 4) Run validation
Typical commands (adjust to repo):
```bash
pnpm lint
pnpm test  # Only if quick unit tests
# Note: Skip long-running Playwright tests to avoid blocking
```

### 5) Doc sync
Append to DEVLOG.md:
- UTC timestamp
- What changed
- What was tested
- What’s next

Update README.md if any instructions changed.

### 6) Prompt system improvement (optional but encouraged)
If the bug happened because of workflow gaps (no tests, no validation step),
apply a minimal patch to `.kiro/prompts/` and log it.

## Output
- Files changed
- Tests run (exact commands)
- Demo path status
- Recommended next steps (do not execute long-running tests)
