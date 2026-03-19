# Frontend Design Agent Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Create a specialized Kiro custom agent for front-end design expertise with browser automation and documentation access.

**Architecture:** Configuration-based agent setup using Kiro's agent system with MCP servers (Playwright for browser automation, Context7 for documentation) and custom design prompts.

**Tech Stack:** Kiro CLI agent system, Playwright MCP, Context7 MCP, JSON configuration files

---

## Task 1: Create Agent Directory Structure

**Files:**
- Create: `.kiro/agents/` directory
- Create: `.kiro/settings/` directory

**Step 1: Create agents directory**

Run: `mkdir -p .kiro/agents`
Expected: Directory created successfully

**Step 2: Create settings directory**

Run: `mkdir -p .kiro/settings`
Expected: Directory created successfully

**Step 3: Verify directories exist**

Run: `ls -la .kiro/`
Expected: Output shows `agents/` and `settings/` directories

**Step 4: Commit directory structure**

```bash
git add .kiro/agents/ .kiro/settings/
git commit -m "feat: add agent directory structure for frontend-designer"
```

---

## Task 2: Create MCP Server Configuration

**Files:**
- Create: `.kiro/settings/mcp.json`

**Step 1: Write MCP configuration**

Create `.kiro/settings/mcp.json`:

```json
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": ["@anthropic/mcp-playwright"],
      "env": {},
      "autoApprove": [
        "playwright_navigate",
        "playwright_screenshot",
        "playwright_click",
        "playwright_evaluate"
      ]
    },
    "context7": {
      "command": "npx",
      "args": ["-y", "@anthropic/mcp-context7"],
      "env": {},
      "autoApprove": [
        "search_docs",
        "get_docs"
      ]
    }
  }
}
```

**Step 2: Validate JSON syntax**

Run: `npx jsonlint .kiro/settings/mcp.json`
Expected: Valid JSON - no errors

**Step 3: Commit MCP configuration**

```bash
git add .kiro/settings/mcp.json
git commit -m "feat: add MCP server configuration for Playwright and Context7"
```

---

## Task 3: Create Agent Configuration

**Files:**
- Create: `.kiro/agents/frontend-designer.json`

**Step 1: Write agent configuration**

Create `.kiro/agents/frontend-designer.json`:

```json
{
  "name": "frontend-designer",
  "description": "Front-end design expert with browser automation, modern CSS/Tailwind, shadcn/ui, and accessibility expertise",
  "prompt": "You are a front-end design expert specializing in modern web development. Your expertise includes:\n\n**Core Technologies:**\n- Next.js 15 App Router (Server Components, Client Components, Server Actions)\n- React 19 (hooks, patterns, performance optimization)\n- TypeScript (strict mode, type-safe components)\n- Tailwind CSS v4 (utility-first, custom configurations)\n- shadcn/ui (component patterns, customization, theming)\n\n**Design Expertise:**\n- UI/UX best practices and design systems\n- Responsive design (mobile-first, fluid typography, container queries)\n- Accessibility (WCAG 2.1 AA compliance, ARIA, semantic HTML)\n- Modern CSS (clamp(), min/max, :has(), subgrid, CSS variables)\n- Animation (Framer Motion, CSS transitions/animations)\n- Color theory, typography, spacing systems\n\n**Workflow:**\n1. Always inspect the current state before suggesting changes\n2. Take screenshots to understand visual context\n3. Use accessibility snapshots to identify a11y issues\n4. Reference existing component patterns in the codebase\n5. Provide specific Tailwind classes, not generic CSS\n6. Explain the \"why\" behind design decisions\n\n**Principles:**\n- Consistency over novelty - match existing patterns\n- Accessibility is not optional\n- Performance matters - avoid unnecessary client components\n- Mobile-first responsive design\n- Semantic HTML structure",
  "model": "claude-sonnet-4",
  "tools": [
    "read",
    "write",
    "glob",
    "grep",
    "shell",
    "@playwright",
    "@context7"
  ],
  "allowedTools": [
    "read",
    "write",
    "glob",
    "grep",
    "shell:pnpm",
    "shell:npm",
    "shell:npx",
    "@playwright/*",
    "@context7/*"
  ],
  "resources": [
    "file://.kiro/steering/**/*.md",
    "file://src/components/**/*.tsx",
    "file://src/app/**/*.tsx",
    "file://tailwind.config.js",
    "file://src/styles/**/*.css"
  ],
  "toolsSettings": {
    "read": {
      "allowedPaths": [
        "./src/**",
        "./public/**",
        "./.kiro/**",
        "./tailwind.config.js",
        "./tailwind.config.ts"
      ]
    },
    "write": {
      "allowedPaths": [
        "./src/**",
        "./public/**"
      ]
    }
  }
}
```

**Step 2: Validate agent configuration JSON**

Run: `npx jsonlint .kiro/agents/frontend-designer.json`
Expected: Valid JSON - no errors

**Step 3: Verify required fields**

Run: `cat .kiro/agents/frontend-designer.json | grep -E '"name"|"description"|"prompt"|"model"|"tools"'`
Expected: All required fields present

**Step 4: Commit agent configuration**

```bash
git add .kiro/agents/frontend-designer.json
git commit -m "feat: add frontend-designer agent configuration"
```

---

## Task 4: Create UI Review Prompt

**Files:**
- Create: `.kiro/prompts/ui-review.md`

**Step 1: Write UI review prompt**

Create `.kiro/prompts/ui-review.md`:

```markdown
# UI Review

Review the current page for design issues and provide actionable feedback.

## Process

1. **Navigate to the page**
   - If not already there, navigate to the specified URL or component
   - Ensure the development server is running (`pnpm dev`)

2. **Capture current state**
   - Take a screenshot of the full page
   - Take screenshots at different viewport sizes:
     - Mobile: 375px width
     - Tablet: 768px width
     - Desktop: 1280px width

3. **Accessibility snapshot**
   - Capture accessibility tree
   - Identify missing alt text, ARIA labels, and semantic HTML issues

4. **Visual analysis**
   - Check spacing consistency (padding, margins, gaps)
   - Verify alignment (flex/grid layouts)
   - Assess color contrast ratios (text, interactive elements)
   - Review typography hierarchy (font sizes, weights, line heights)

5. **Responsive behavior**
   - Test at each breakpoint (mobile, tablet, desktop)
   - Check for horizontal overflow
   - Verify touch targets are 44x44px minimum on mobile
   - Ensure text is readable without zooming

6. **Provide recommendations**
   - List specific Tailwind classes to use (e.g., `space-y-4`, `text-lg`, `md:grid-cols-2`)
   - Explain the "why" behind each suggestion
   - Reference similar components in the codebase for consistency
   - Prioritize issues by severity (critical, important, nice-to-have)

## Example Output

**Critical Issues:**
- Color contrast ratio 3:1 on button text - needs 4.5:1 minimum
- Fix: Replace `text-gray-400` with `text-gray-900`

**Important Issues:**
- Inconsistent spacing between sections (some use `gap-4`, others `gap-6`)
- Fix: Standardize to `gap-6` to match design system

**Nice-to-Have:**
- Add hover states to interactive cards
- Fix: Add `hover:shadow-lg transition-shadow duration-200`
```

**Step 2: Commit UI review prompt**

```bash
git add .kiro/prompts/ui-review.md
git commit -m "feat: add UI review prompt for frontend-designer"
```

---

## Task 5: Create Accessibility Audit Prompt

**Files:**
- Create: `.kiro/prompts/a11y-audit.md`

**Step 1: Write accessibility audit prompt**

Create `.kiro/prompts/a11y-audit.md`:

```markdown
# Accessibility Audit

Perform a comprehensive WCAG 2.1 AA accessibility audit of the page or component.

## Process

1. **Capture accessibility tree**
   - Use Playwright accessibility snapshot
   - Identify all interactive elements and their roles

2. **Semantic HTML check**
   - Verify proper heading hierarchy (h1 → h2 → h3, no skipping levels)
   - Ensure landmarks are used (header, nav, main, aside, footer)
   - Check that buttons are `<button>` elements, not divs
   - Verify links have meaningful text (not "click here")

3. **Image accessibility**
   - Check all `<img>` tags have descriptive alt text
   - Decorative images should have `alt=""` or `role="presentation"`
   - SVG icons need `aria-label` or accessible text

4. **Keyboard navigation**
   - Test tab order is logical
   - Verify all interactive elements are keyboard accessible
   - Check for visible focus indicators
   - Ensure no keyboard traps

5. **Color contrast**
   - Test all text against backgrounds (minimum 4.5:1 for normal text, 3:1 for large text)
   - Check interactive element states (hover, focus, disabled)
   - Verify color is not the only means of conveying information

6. **ARIA attributes**
   - Check for proper `aria-label`, `aria-labelledby`, `aria-describedby`
   - Verify `aria-expanded` on collapsible elements
   - Ensure `aria-hidden` is used correctly (not on focusable elements)
   - Check `role` attributes are appropriate

7. **Form accessibility**
   - All inputs have associated `<label>` elements
   - Error messages are announced to screen readers
   - Required fields are indicated accessibly (`aria-required` or required attribute)
   - Form validation is accessible

## Report Format

### WCAG 2.1 AA Violations

**Critical (Blocks usage):**
- Issue: Missing alt text on product images
- WCAG: 1.1.1 Non-text Content
- Fix: Add descriptive alt text: `<img src="product.jpg" alt="Blue cotton t-shirt, front view" />`

**Important (Creates barriers):**
- Issue: Insufficient color contrast on secondary buttons (2.8:1)
- WCAG: 1.4.3 Contrast (Minimum)
- Fix: Replace `bg-blue-300 text-blue-100` with `bg-blue-600 text-white`

**Recommended (Best practices):**
- Issue: Heading hierarchy skips from h1 to h3
- WCAG: 1.3.1 Info and Relationships
- Fix: Change `<h3>` to `<h2>` in section headers

### Summary

- Total issues: X
- Critical: X
- Important: X
- Recommended: X
```

**Step 2: Commit accessibility audit prompt**

```bash
git add .kiro/prompts/a11y-audit.md
git commit -m "feat: add accessibility audit prompt for frontend-designer"
```

---

## Task 6: Create Responsive Design Check Prompt

**Files:**
- Create: `.kiro/prompts/responsive-check.md`

**Step 1: Write responsive design check prompt**

Create `.kiro/prompts/responsive-check.md`:

```markdown
# Responsive Design Check

Test responsive behavior across breakpoints and identify layout issues.

## Process

1. **Take screenshots at each breakpoint**
   - Mobile: 375px width (iPhone SE)
   - Tablet: 768px width (iPad)
   - Desktop: 1280px width (standard laptop)
   - Large: 1920px width (full HD monitor)

2. **Mobile (< 640px) checks**
   - Text is readable without zooming (minimum 16px)
   - Touch targets are minimum 44x44px
   - No horizontal scrolling
   - Images scale appropriately
   - Navigation is mobile-friendly (hamburger menu or simplified)

3. **Tablet (640px - 1024px) checks**
   - Layout transitions smoothly from mobile
   - Touch targets remain accessible
   - Content uses available space effectively
   - Typography scales appropriately

4. **Desktop (> 1024px) checks**
   - Layout uses grid/multi-column where appropriate
   - Maximum content width prevents overly long lines (60-80 characters)
   - Hover states work correctly
   - No wasted space

5. **Responsive patterns**
   - Check for Tailwind responsive prefixes (`sm:`, `md:`, `lg:`, `xl:`)
   - Verify fluid typography (using `clamp()` or responsive sizes)
   - Test container queries if used
   - Verify flexible images and media

## Common Issues and Fixes

**Issue: Text too small on mobile**
- Current: `text-sm` (14px)
- Fix: `text-base md:text-sm` (16px on mobile, 14px on desktop)

**Issue: Fixed width causes horizontal scroll**
- Current: `w-96` (384px fixed)
- Fix: `w-full max-w-sm` (fluid with max width)

**Issue: Same layout on all screen sizes**
- Current: `grid grid-cols-3`
- Fix: `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`

**Issue: Hidden overflow on mobile**
- Current: Content gets cut off
- Fix: Use `overflow-x-auto` or rethink layout

**Issue: Images don't scale**
- Current: `<img src="..." />`
- Fix: `<img src="..." className="w-full h-auto" />`
```

**Step 2: Commit responsive design check prompt**

```bash
git add .kiro/prompts/responsive-check.md
git commit -m "feat: add responsive design check prompt for frontend-designer"
```

---

## Task 7: Create Component Styling Prompt

**Files:**
- Create: `.kiro/prompts/component-style.md`

**Step 1: Write component styling prompt**

Create `.kiro/prompts/component-style.md`:

```markdown
# Component Styling Improvement

Improve the styling of a specific component using shadcn/ui patterns and Tailwind best practices.

## Process

1. **Read current component**
   - Examine the component code
   - Identify the component type (button, card, form, etc.)
   - Note current styling approach

2. **Analyze existing patterns**
   - Search for similar components in the codebase
   - Identify the design system patterns being used
   - Check if shadcn/ui components are available
   - Review Tailwind configuration for custom colors/spacing

3. **Identify improvements**
   - Inconsistencies with design system
   - Missing interactive states (hover, focus, active, disabled)
   - Accessibility issues
   - Responsive behavior
   - Dark mode compatibility

4. **Apply shadcn/ui patterns**
   - Use shadcn/ui component structure if available
   - Apply the project's variant patterns
   - Use the `cn()` utility for conditional classes
   - Follow the established prop API

5. **Tailwind best practices**
   - Use semantic spacing scale (4, 8, 12, 16, 24, 32px)
   - Prefer utility classes over custom CSS
   - Use Tailwind's color palette consistently
   - Group related utilities (layout, spacing, colors, typography)
   - Use responsive prefixes consistently

6. **Dark mode**
   - Add `dark:` variants where needed
   - Test contrast in both light and dark modes
   - Use CSS variables from the theme if available

7. **Interactive states**
   - Add `hover:` for pointer devices
   - Add `focus:` and `focus-visible:` for keyboard
   - Add `active:` for click feedback
   - Add `disabled:` for disabled states
   - Use `transition-*` for smooth state changes

## Example Improvements

**Before:**
```tsx
<button
  className="bg-blue-500 text-white px-4 py-2 rounded"
  onClick={handleClick}
>
  Click me
</button>
```

**After:**
```tsx
<button
  className={cn(
    "inline-flex items-center justify-center rounded-md",
    "px-4 py-2 text-sm font-medium",
    "bg-blue-600 text-white",
    "hover:bg-blue-700 focus-visible:outline-none",
    "focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2",
    "active:bg-blue-800 disabled:pointer-events-none disabled:opacity-50",
    "transition-colors duration-200",
    "dark:bg-blue-500 dark:hover:bg-blue-600"
  )}
  onClick={handleClick}
>
  Click me
</button>
```

**Improvements made:**
- Added focus-visible ring for keyboard users
- Added hover and active states
- Added disabled state styling
- Added dark mode support
- Added smooth transitions
- Used semantic sizing and spacing
- Improved color contrast
```

**Step 2: Commit component styling prompt**

```bash
git add .kiro/prompts/component-style.md
git commit -m "feat: add component styling prompt for frontend-designer"
```

---

## Task 8: Create Validation Test

**Files:**
- Create: `tests/unit/agent-config-validation.test.ts`

**Step 1: Write validation test**

Create `tests/unit/agent-config-validation.test.ts`:

```typescript
import { describe, it, expect } from '@jest/globals';
import * as fs from 'fs';
import * as path from 'path';

describe('Frontend Designer Agent Configuration', () => {
  const agentConfigPath = path.join(process.cwd(), '.kiro/agents/frontend-designer.json');
  const mcpConfigPath = path.join(process.cwd(), '.kiro/settings/mcp.json');

  it('should have valid agent configuration JSON', () => {
    expect(fs.existsSync(agentConfigPath)).toBe(true);

    const configContent = fs.readFileSync(agentConfigPath, 'utf-8');
    const config = JSON.parse(configContent); // Will throw if invalid JSON

    expect(config.name).toBe('frontend-designer');
    expect(config.description).toBeTruthy();
    expect(config.prompt).toBeTruthy();
    expect(config.model).toMatch(/^claude-(sonnet|opus)-4/);
    expect(Array.isArray(config.tools)).toBe(true);
  });

  it('should include required tools', () => {
    const configContent = fs.readFileSync(agentConfigPath, 'utf-8');
    const config = JSON.parse(configContent);

    expect(config.tools).toContain('read');
    expect(config.tools).toContain('write');
    expect(config.tools).toContain('glob');
    expect(config.tools).toContain('grep');
    expect(config.tools).toContain('@playwright');
    expect(config.tools).toContain('@context7');
  });

  it('should have resource configuration', () => {
    const configContent = fs.readFileSync(agentConfigPath, 'utf-8');
    const config = JSON.parse(configContent);

    expect(Array.isArray(config.resources)).toBe(true);
    expect(config.resources.length).toBeGreaterThan(0);

    const hasSteeringFiles = config.resources.some((r: string) => r.includes('steering'));
    const hasComponents = config.resources.some((r: string) => r.includes('components'));

    expect(hasSteeringFiles).toBe(true);
    expect(hasComponents).toBe(true);
  });

  it('should have valid MCP configuration', () => {
    expect(fs.existsSync(mcpConfigPath)).toBe(true);

    const configContent = fs.readFileSync(mcpConfigPath, 'utf-8');
    const config = JSON.parse(configContent);

    expect(config.mcpServers).toBeDefined();
    expect(config.mcpServers.playwright).toBeDefined();
    expect(config.mcpServers.context7).toBeDefined();
  });

  it('should have all design prompts', () => {
    const promptsDir = path.join(process.cwd(), '.kiro/prompts');

    expect(fs.existsSync(path.join(promptsDir, 'ui-review.md'))).toBe(true);
    expect(fs.existsSync(path.join(promptsDir, 'a11y-audit.md'))).toBe(true);
    expect(fs.existsSync(path.join(promptsDir, 'responsive-check.md'))).toBe(true);
    expect(fs.existsSync(path.join(promptsDir, 'component-style.md'))).toBe(true);
  });
});
```

**Step 2: Run validation tests**

Run: `npx jest tests/unit/agent-config-validation.test.ts`
Expected: All tests pass (5/5 passing)

**Step 3: Commit validation tests**

```bash
git add tests/unit/agent-config-validation.test.ts
git commit -m "test: add agent configuration validation tests"
```

---

## Task 9: Create README Documentation

**Files:**
- Create: `.kiro/agents/README.md`

**Step 1: Write agent documentation**

Create `.kiro/agents/README.md`:

```markdown
# Frontend Designer Agent

A specialized Kiro agent for front-end design work, equipped with browser automation, documentation access, and design expertise.

## Features

- **Browser Automation**: Playwright MCP for screenshots, accessibility snapshots, and page interaction
- **Documentation Access**: Context7 MCP for Tailwind CSS, shadcn/ui, and React documentation
- **Design Expertise**: System prompt with modern CSS, responsive design, and accessibility knowledge
- **Custom Prompts**: Pre-built workflows for UI review, accessibility audits, responsive checks, and component styling

## Quick Start

### 1. Install Playwright Browser

```bash
npx playwright install chromium
```

### 2. Start the Agent

```bash
kiro-cli --agent frontend-designer
```

### 3. Use Design Prompts

In the agent session:
- `@ui-review` - Review current page for design issues
- `@a11y-audit` - Perform WCAG 2.1 AA accessibility audit
- `@responsive-check` - Test responsive behavior across breakpoints
- `@component-style` - Improve component styling with shadcn/ui patterns

## Usage Examples

### UI Review
```
@ui-review

Please review the home page at http://localhost:3000
```

### Accessibility Audit
```
@a11y-audit

Audit the trade simulator page for WCAG compliance
```

### Responsive Check
```
@responsive-check

Check the journal page responsiveness
```

### Component Styling
```
@component-style

Improve the TradeCard component styling to match shadcn/ui patterns
```

## Configuration

### Agent Config
Location: `.kiro/agents/frontend-designer.json`

### MCP Servers
- **Playwright**: Browser automation via `@anthropic/mcp-playwright`
- **Context7**: Documentation access via `@anthropic/mcp-context7`

### Allowed Tools
- File operations: `read`, `write`, `glob`, `grep`
- Shell commands: `pnpm`, `npm`, `npx`
- Browser automation: All Playwright tools
- Documentation: All Context7 tools

### Resources
- Steering files: `.kiro/steering/**/*.md`
- Components: `src/components/**/*.tsx`
- Pages: `src/app/**/*.tsx`
- Config: `tailwind.config.js`, `src/styles/**/*.css`

## Design Principles

The agent follows these principles:
- **Consistency over novelty** - Match existing patterns
- **Accessibility is not optional** - WCAG 2.1 AA compliance
- **Performance matters** - Avoid unnecessary client components
- **Mobile-first responsive design** - Progressive enhancement
- **Semantic HTML structure** - Proper element usage

## Troubleshooting

### Playwright browser not available
```bash
npx playwright install chromium
```

### Development server not running
```bash
pnpm dev
```

### MCP server timeout
Check network connection and retry. Context7 requires internet access for documentation.

## Tech Stack Knowledge

The agent is trained on:
- Next.js 15 App Router
- React 19
- TypeScript
- Tailwind CSS v4
- shadcn/ui
- Modern CSS (container queries, :has(), subgrid)
- Framer Motion
- WCAG 2.1 AA standards
```

**Step 2: Commit README**

```bash
git add .kiro/agents/README.md
git commit -m "docs: add frontend-designer agent README"
```

---

## Task 10: Manual Verification

**Files:**
- N/A (manual testing)

**Step 1: Start the agent**

Run: `kiro-cli --agent frontend-designer`
Expected: Agent loads without errors, shows frontend-designer configuration

**Step 2: Test browser automation**

In agent session, run:
```
Navigate to http://localhost:3000 and take a screenshot of the home page
```
Expected: Screenshot is captured and displayed

**Step 3: Test documentation access**

In agent session, run:
```
Look up Tailwind CSS utility classes for creating a responsive grid layout
```
Expected: Documentation is fetched and relevant classes are provided

**Step 4: Test file operations**

In agent session, run:
```
Read the TradeCard component and identify its current Tailwind classes
```
Expected: Component is read and classes are listed

**Step 5: Test design prompt**

In agent session, run:
```
@ui-review

Review the home page at http://localhost:3000
```
Expected: Prompt loads, screenshots are taken, feedback is provided

**Step 6: Document results**

Create verification report with:
- Agent startup: ✅ or ❌
- Browser automation: ✅ or ❌
- Documentation access: ✅ or ❌
- File operations: ✅ or ❌
- Design prompts: ✅ or ❌

---

## Task 11: Final Commit and Documentation

**Files:**
- Update: `DEVLOG.md`

**Step 1: Update DEVLOG**

Add entry to `DEVLOG.md`:

```markdown
## 2026-01-08 [TIME] UTC - Frontend Design Agent Implementation

### Completed ✅
- **Agent Configuration**: Created frontend-designer custom agent
  - Browser automation with Playwright MCP
  - Documentation access with Context7 MCP
  - Design-focused system prompt
- **Design Prompts**: Created 4 workflow prompts
  - UI review for visual feedback
  - Accessibility audit for WCAG compliance
  - Responsive design checks
  - Component styling improvements
- **Validation**: Tests confirm configuration validity
- **Documentation**: README with usage examples

### Technical Achievements ✅
- MCP server integration (Playwright + Context7)
- Custom agent configuration with tool permissions
- Design expertise system prompt
- Workflow-based prompts for common tasks

### Files Created
- `.kiro/agents/frontend-designer.json` - Agent configuration
- `.kiro/settings/mcp.json` - MCP server setup
- `.kiro/prompts/ui-review.md` - UI review workflow
- `.kiro/prompts/a11y-audit.md` - Accessibility audit workflow
- `.kiro/prompts/responsive-check.md` - Responsive testing workflow
- `.kiro/prompts/component-style.md` - Component styling workflow
- `.kiro/agents/README.md` - Agent documentation
- `tests/unit/agent-config-validation.test.ts` - Validation tests

### Time Tracking
- Agent configuration: 15 minutes
- Design prompts: 30 minutes
- Validation tests: 10 minutes
- Documentation: 10 minutes
- Manual testing: 10 minutes
- **Total Session**: 1.25 hours
```

**Step 2: Commit DEVLOG update**

```bash
git add DEVLOG.md
git commit -m "docs: update DEVLOG with frontend-designer agent implementation"
```

**Step 3: Create final summary commit**

```bash
git log --oneline --since="1 day ago" > /tmp/commits.txt
git add -A
git commit -m "feat: complete frontend-designer agent implementation

- Created custom Kiro agent for front-end design expertise
- Integrated Playwright MCP for browser automation
- Integrated Context7 MCP for documentation access
- Added 4 workflow prompts for common design tasks
- Validated configuration with unit tests
- Documented usage in README

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Notes

- **DRY**: Reuse the same MCP configuration for any future agents
- **YAGNI**: Only created prompts for immediate use cases (UI review, a11y, responsive, component styling)
- **TDD**: Validation tests ensure configuration correctness
- **Frequent commits**: Each major step has its own commit for easy rollback

## Dependencies

- Kiro CLI (already installed)
- Node.js 18+ (already available)
- Playwright browser: `npx playwright install chromium`
- Development server: `pnpm dev` (for browser testing)

## Verification Checklist

- [ ] Agent configuration JSON is valid
- [ ] MCP servers are configured (Playwright + Context7)
- [ ] All 4 design prompts exist
- [ ] Validation tests pass
- [ ] Agent loads without errors
- [ ] Browser automation works (screenshot test)
- [ ] Documentation access works (Tailwind lookup test)
- [ ] File operations work (component read test)
- [ ] Design prompts load correctly
- [ ] README documentation is complete

## Success Criteria

The implementation is complete when:
1. All validation tests pass
2. Agent loads successfully with `kiro-cli --agent frontend-designer`
3. Manual verification confirms all features work
4. Documentation is complete and accurate
