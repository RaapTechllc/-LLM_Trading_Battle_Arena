# Implementation Plan: Frontend Design Agent

## Overview

Create a specialized Kiro agent for front-end design work, equipped with browser automation (Playwright MCP), documentation access (Context7 MCP), and file system tools. The implementation involves creating configuration files and prompt templates.

## Tasks

- [ ] 1. Set up agent directory structure
  - Create `.kiro/agents/` directory if not exists
  - Create `.kiro/settings/` directory if not exists
  - _Requirements: 1.1_

- [ ] 2. Create MCP server configuration
  - [ ] 2.1 Create or update `.kiro/settings/mcp.json`
    - Add Playwright MCP server configuration
    - Add Context7 MCP server configuration
    - _Requirements: 2.1, 4.2, 4.3_

- [ ] 3. Create agent configuration
  - [ ] 3.1 Create `.kiro/agents/frontend-designer.json`
    - Define agent name and description
    - Set model to claude-sonnet-4
    - Configure tools array with read, write, glob, grep, shell, @playwright, @context7
    - Configure allowedTools for auto-approval
    - Set up resources for steering files and components
    - Configure toolsSettings for path restrictions
    - _Requirements: 1.1, 1.2, 1.3, 2.1, 3.1, 3.2, 3.3, 3.4, 4.1_

  - [ ] 3.2 Write system prompt for front-end design expertise
    - Include core technologies (Next.js 15, React 19, TypeScript, Tailwind v4, shadcn/ui)
    - Include design expertise (responsive, accessibility, animations)
    - Define workflow and principles
    - _Requirements: 1.4, 4.4, 4.5, 4.7, 7.1, 7.2, 7.3, 7.4, 7.5, 7.6_

- [ ] 4. Create design prompts
  - [ ] 4.1 Create `.kiro/prompts/ui-review.md`
    - Define steps for visual review workflow
    - Include screenshot and accessibility snapshot steps
    - _Requirements: 6.1, 5.1, 5.2, 5.3_

  - [ ] 4.2 Create `.kiro/prompts/a11y-audit.md`
    - Define accessibility audit workflow
    - Include WCAG 2.1 AA checklist items
    - _Requirements: 6.2, 5.4_

  - [ ] 4.3 Create `.kiro/prompts/responsive-check.md`
    - Define responsive testing workflow
    - Include breakpoint screenshots (mobile, tablet, desktop)
    - _Requirements: 6.3_

  - [ ] 4.4 Create `.kiro/prompts/component-style.md`
    - Define component styling workflow
    - Include shadcn/ui and Tailwind patterns
    - _Requirements: 6.4_

- [ ] 5. Checkpoint - Verify configuration
  - Ensure all files are created and valid JSON
  - Test agent loads with `kiro-cli --agent frontend-designer`
  - Ask the user if questions arise

- [ ] 6. Validation tests
  - [ ] 6.1 Verify agent config JSON is valid and contains required fields
    - **Property 1: Agent Configuration Validity**
    - **Validates: Requirements 1.1, 1.2, 1.3, 2.1, 3.1-3.4, 4.2, 4.3**

  - [ ] 6.2 Verify all prompt files exist
    - **Property 3: Design Prompts Existence**
    - **Validates: Requirements 6.1, 6.2, 6.3, 6.4**

## Notes
- MCP servers run via npx, no installation required
- Playwright browser may need installation: `npx playwright install chromium`
- Agent can be tested immediately after task 5
