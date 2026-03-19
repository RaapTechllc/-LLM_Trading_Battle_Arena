# BattleCard Arena - Technical Architecture

## Technology Stack
- **Frontend**: Next.js 15 App Router, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Server Actions
- **Database**: Prisma ORM with SQLite (local) / Neon PostgreSQL (prod)
- **Testing**: Playwright for E2E, Jest for unit tests
- **Deployment**: Vercel (frontend), Neon (database)
- **Development**: pnpm, ESLint, Prettier

## Architecture Overview
- **Monolithic Next.js app** with API routes for backend logic
- **Database-first design** with Prisma schema driving data models
- **Component-based UI** with reusable card and battle components
- **Mock-first development** for rapid prototyping without external deps

## Development Environment
- Node.js 18+, pnpm 8+
- SQLite for local development (zero config)
- Environment variables: DATABASE_URL only
- Hot reload for rapid iteration

## Code Standards
- TypeScript strict mode enabled
- Tailwind for styling (no custom CSS)
- Server Actions for mutations
- Client Components only when needed

## Testing Strategy
- Playwright E2E tests for critical user paths
- Component testing with React Testing Library
- Database testing with in-memory SQLite

## Deployment Process
- Vercel for automatic deployments
- Neon PostgreSQL for production database
- Environment-based configuration

## Performance Requirements
- < 2s initial page load
- < 500ms navigation between pages
- Responsive design for mobile/desktop

## Security Considerations
- No real money or financial data
- Input validation on all forms
- SQL injection prevention via Prisma
- Educational disclaimers prominently displayed
