# BattleCard Arena - Project Structure

## Directory Layout
```
battlecard-arena/
├── src/
│   ├── app/                 # Next.js App Router pages
│   │   ├── (auth)/         # Auth-protected routes
│   │   ├── api/            # API routes
│   │   └── globals.css     # Global styles
│   ├── components/         # Reusable UI components
│   │   ├── ui/            # Base UI components
│   │   ├── cards/         # Card-related components
│   │   └── battle/        # Battle system components
│   ├── lib/               # Utility functions
│   └── types/             # TypeScript type definitions
├── prisma/
│   ├── schema.prisma      # Database schema
│   └── migrations/        # Database migrations
├── tests/
│   ├── e2e/              # Playwright E2E tests
│   └── unit/             # Jest unit tests
├── docs/
│   ├── prd/              # Product requirements
│   ├── plans/            # Implementation plans
│   └── demo-script.md    # Demo walkthrough
└── .kiro/
    ├── steering/         # Project context
    └── prompts/          # Custom commands
```

## File Naming Conventions
- **Components**: PascalCase (`BattleCard.tsx`)
- **Pages**: kebab-case (`create-card/page.tsx`)
- **Utilities**: camelCase (`cardUtils.ts`)
- **Types**: PascalCase with `.types.ts` suffix
- **Tests**: `.test.ts` or `.spec.ts` suffix

## Module Organization
- **Feature-based**: Group related components, hooks, and utilities
- **Barrel exports**: Use `index.ts` files for clean imports
- **Separation of concerns**: UI, business logic, and data layers distinct

## Configuration Files
- **Environment**: `.env.local` for local development
- **Database**: `prisma/schema.prisma` for data models
- **Testing**: `playwright.config.ts`, `jest.config.js`
- **Kiro**: `.kiro/` directory for AI-assisted development

## Documentation Structure
- **Product**: `docs/prd/` for requirements and specifications
- **Technical**: `docs/plans/` for implementation details
- **Process**: `DEVLOG.md` for development timeline
- **User**: `README.md` for setup and usage

## Asset Organization
- **Static**: `public/` for images, icons, and static files
- **Styles**: Tailwind classes only, no custom CSS files
- **Icons**: Lucide React for consistent iconography

## Build Artifacts
- **Next.js**: `.next/` directory (gitignored)
- **Database**: `prisma/dev.db` for SQLite (gitignored)
- **Tests**: `test-results/` and `playwright-report/` (gitignored)

## Environment-Specific Files
- **Local**: SQLite database, no external dependencies
- **Production**: Neon PostgreSQL via DATABASE_URL
- **Testing**: In-memory SQLite for isolated tests
