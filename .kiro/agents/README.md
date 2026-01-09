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
