# CLAUDE.md — LLM Trading Battle Arena

## Project Overview

LLM Trading Battle Arena is an educational, gamified trading simulation where AI models (Grok, Claude, DeepSeek, GPT-5, Gemini, Qwen) compete in simulated trading scenarios. Successful trades generate collectible holographic cards with rarity based on P&L performance. **No real money is ever involved** — this is strictly a paper-trading simulation for entertainment and education.

## Tech Stack

- **Framework**: Next.js 15 with App Router (React 18, TypeScript strict mode)
- **Styling**: Tailwind CSS 3.4 — no custom CSS files except `globals.css`
- **Database**: Prisma ORM with SQLite (local dev) / PostgreSQL via Neon (production)
- **Testing**: Jest 29 (unit) + Playwright 1.49 (E2E)
- **Linting**: ESLint with `next/core-web-vitals` preset
- **Deployment**: Vercel (serverless, region: iad1)
- **AI Integration**: OpenRouter API for LLM trade decisions
- **Rate Limiting**: Upstash Redis (production) with in-memory fallback (local)

## Quick Start

```bash
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run db:seed
npm run dev          # starts on http://localhost:3030
```

## Repository Structure

```
src/
├── app/                    # Next.js App Router pages & API routes
│   ├── layout.tsx          # Root layout with navigation
│   ├── page.tsx            # Landing page (hero, live bulletin, stats)
│   ├── simulate/           # Trade simulator interface
│   ├── journal/            # Trade cards collection browser
│   ├── leaderboard/        # AI model rankings
│   ├── showdown/           # Model vs model battles
│   ├── battle/             # Battle arena interface
│   ├── battle-history/     # Past battles log
│   ├── achievements/       # Achievement system
│   ├── deck-builder/       # Deck customization
│   ├── trade/              # Individual trade view
│   ├── globals.css         # Global CSS variables & base styles
│   └── api/                # API route handlers
│       ├── generate-trade/ # POST - AI trade decision via OpenRouter
│       ├── trade-cards/    # GET/POST - trade card CRUD
│       ├── leaderboard/    # GET - model rankings
│       ├── showdown/       # GET/POST - model battles
│       ├── live-showdown/  # POST - real-time battle streaming
│       ├── auto-trade/     # POST - automated trading
│       ├── market/         # GET - live market prices
│       ├── models/         # GET - model analytics & comparison
│       └── trades/         # POST - batch trade operations
├── components/             # React components
│   ├── TradeSimulator.tsx  # Main simulator UI
│   ├── TradeJournal.tsx    # Card collection browser
│   ├── Leaderboard.tsx     # Rankings display
│   ├── ModelShowdown.tsx   # Battle setup and results
│   ├── LiveShowdown.tsx    # Real-time battle display
│   ├── BattleArena.tsx     # Battle arena UI (largest component)
│   ├── BattleHistory.tsx   # Past battles viewer
│   ├── LivePriceTicker.tsx # Real-time prices display
│   ├── FearGreedGauge.tsx  # Market sentiment gauge
│   ├── ErrorBoundary.tsx   # Error handling wrapper
│   ├── KeyboardShortcuts.tsx
│   ├── SoundToggle.tsx
│   ├── AutoTradeButton.tsx
│   ├── DemoScript.tsx
│   ├── AchievementNotification.tsx
│   ├── AIOpponentSelector.tsx
│   ├── cards/              # Card display components
│   │   └── TradeCard.tsx
│   └── ui/                 # Shared UI primitives
│       ├── HolographicCard.tsx
│       ├── ASCIICardArt.tsx
│       └── StatCard.tsx
├── lib/                    # Business logic & utilities
│   ├── constants.ts        # Models, assets, directions, rarity logic
│   ├── trading-constants.ts# Sample trades, rarity definitions
│   ├── openrouter.ts       # OpenRouter API integration
│   ├── prisma.ts           # Prisma client singleton
│   ├── rate-limit.ts       # Rate limiting (Upstash Redis / in-memory)
│   ├── session.ts          # Session management
│   ├── achievements.ts     # Achievement system logic
│   ├── ai-opponents.ts     # AI difficulty levels and strategies
│   ├── sounds.ts           # Audio effects library
│   ├── ascii-art.ts        # ASCII card art generation
│   └── performance.ts      # Performance monitoring utilities
└── styles/
    └── globals.css         # (legacy location, primary is app/globals.css)

prisma/
├── schema.prisma           # Database schema (3 models)
├── migrations/             # Migration history
├── seed.ts                 # Database seeder
└── dev.db                  # Local SQLite database (gitignored)

tests/
├── e2e/                    # Playwright E2E tests (13 files)
│   ├── golden-path.spec.ts # Complete user journey
│   ├── trading.spec.ts     # Trade simulation flow
│   └── ...                 # Feature-specific E2E tests
├── unit/                   # Jest unit tests (3 files)
│   ├── agent-config-validation.test.ts
│   ├── analytics-streak.test.ts
│   └── code-review-fixes.test.ts
└── setup.ts                # Jest global setup

docs/                       # Documentation
├── prd/                    # Product requirements
├── plans/                  # Implementation plans
├── demo-script.md          # Demo walkthrough
├── test-plan.md            # Testing strategy
└── deployment-testing.md   # Deployment test guide

scripts/                    # Utility & deployment scripts
.github/workflows/          # CI/CD (deployment-testing.yml)
```

## Key Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server on port 3030 |
| `npm run build` | Production build |
| `npm run start` | Start production server on port 3030 |
| `npm run lint` | Run ESLint |
| `npm run test` | Run Jest unit tests |
| `npm run test:coverage` | Unit tests with coverage report |
| `npm run test:e2e` | Run Playwright E2E tests (local) |
| `npm run test:e2e:production` | E2E tests against production |
| `npm run test:e2e:headed` | E2E tests with visible browser |
| `npm run db:seed` | Seed database with initial data |
| `npm run db:seed:large` | Seed with large dataset |
| `npx prisma generate` | Regenerate Prisma client after schema changes |
| `npx prisma migrate dev` | Apply database migrations |

## Database Schema

Three Prisma models in `prisma/schema.prisma`:

- **TradingModel** — AI models (Grok, Claude, DeepSeek, etc.) with lifetime stats (`totalTrades`, `winCount`, `totalPnlPct`)
- **TradeCard** — Individual trade records with asset, direction, entry/exit prices, leverage, P&L, and rarity tier
- **ModelBattle** — Head-to-head battle records between two models, storing card IDs (as JSON strings) and scores

**Rarity tiers** (based on absolute P&L %):
- `LEGENDARY`: >= 10%
- `EPIC`: >= 5%
- `RARE`: >= 2%
- `COMMON`: < 2%

After modifying `schema.prisma`, always run:
```bash
npx prisma migrate dev --name describe_change
npx prisma generate
```

## Architecture & Conventions

### Next.js App Router
- Pages live in `src/app/<route>/page.tsx` — each is a Server Component by default
- Client Components are marked with `"use client"` at the top
- API routes use `src/app/api/<route>/route.ts` with exported `GET`/`POST` handler functions
- Root layout in `src/app/layout.tsx` includes global navigation

### TypeScript
- Strict mode is enabled (`"strict": true` in `tsconfig.json`)
- Path alias `@/*` maps to `./src/*`
- Type definitions are co-located with constants in `src/lib/constants.ts`
- Use `as const` assertions for constant arrays and objects

### Styling
- Tailwind CSS exclusively — no inline styles or CSS modules
- Custom theme colors defined in `tailwind.config.js`: `arena-bg`, `arena-card`, `arena-border`, `profit`, `loss`, `neutral`, `muted`
- Dark theme by default (backgrounds: `#0a0a0a`, cards: `#141414`)
- Rarity-based visual effects via `RARITY_EFFECTS` constants in `src/lib/constants.ts`

### Components
- Feature components in `src/components/` (PascalCase filenames)
- Shared UI primitives in `src/components/ui/`
- Card-specific components in `src/components/cards/`
- Error boundaries wrap page content via `ErrorBoundary.tsx`

### API Design
- All API routes return JSON with appropriate HTTP status codes
- Rate limiting on `/api/generate-trade` (10 req/min per IP)
- Error responses use `{ error: string }` format
- Trade creation validates all fields and updates model stats atomically via Prisma transactions

### Constants & Configuration
- Trading models, assets, directions, leverage options in `src/lib/constants.ts`
- 6 AI models: Grok 4.20, Claude Sonnet, DeepSeek V3, Qwen 3 Max, GPT-5, Gemini 3
- 13 tradeable assets: BTC, ETH, SOL, AVAX, DOGE, NVDA, TSLA, AAPL, MSFT, GOOGL, META, AMZN, PLTR
- Hardcoded `demo-user` ID for MVP (no auth system)

## Environment Variables

Copy `.env.example` to `.env` for local development:

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | `file:./prisma/dev.db` for local SQLite |
| `OPENROUTER_API_KEY` | For AI trades | OpenRouter API key for LLM decisions |
| `UPSTASH_REDIS_REST_URL` | No | Redis URL for distributed rate limiting |
| `UPSTASH_REDIS_REST_TOKEN` | No | Redis auth token |
| `PAPER_TRADING_MODE` | No | Always `true` — enforced |
| `REAL_MONEY_ENABLED` | No | Always `false` — enforced |
| `ENABLE_LIVE_PRICES` | No | Enable market data ticker |

**Important**: Never commit `.env` files. The app functions without `OPENROUTER_API_KEY` (uses randomized mock data) and without Upstash credentials (falls back to in-memory rate limiting).

## Testing

### Unit Tests (Jest)
- Location: `tests/unit/*.test.ts`
- Config: `jest.config.js` (jsdom environment, Babel transpilation)
- Module aliases: `@/` mapped to `src/`
- Run: `npm run test`

### E2E Tests (Playwright)
- Location: `tests/e2e/*.spec.ts`
- Config: `playwright.config.ts`
- Browsers: Chromium + Mobile Chrome (local), adds Firefox for production
- Local dev server auto-starts on port 3030
- CI: single worker, 2 retries, GitHub reporter
- Traces on first retry, screenshots/video on failure
- Run: `npm run test:e2e`

### Test naming conventions
- Unit tests: `*.test.ts` or `*.test.tsx`
- E2E tests: `*.spec.ts`
- Both are excluded from TypeScript compilation via `tsconfig.json`

## CI/CD Pipeline

GitHub Actions workflow (`.github/workflows/deployment-testing.yml`):
- **Triggers**: push to `main`, PRs to `main`, deployment status changes
- **test-local job**: Install deps, setup DB (prisma generate + migrate + seed), build, run Playwright
- **test-production job**: Runs against deployed URL on successful deployment
- **Artifacts**: Playwright reports uploaded with 30-day retention
- **Node.js**: Version 18
- Uses `npm ci` for reproducible installs

## Deployment

- **Platform**: Vercel
- **Build command** (from `vercel.json`): `prisma generate && next build`
- **Region**: iad1 (US East)
- **Security headers**: X-Frame-Options DENY, X-Content-Type-Options nosniff, strict Referrer-Policy, restricted Permissions-Policy
- **Production DB**: Neon PostgreSQL (configure `DATABASE_URL` in Vercel env)

## Common Patterns for AI Assistants

### Adding a new page
1. Create `src/app/<route>/page.tsx`
2. Add navigation link in `src/app/layout.tsx`
3. Add keyboard shortcut in `src/components/KeyboardShortcuts.tsx` if needed

### Adding a new API endpoint
1. Create `src/app/api/<route>/route.ts`
2. Export named `GET`/`POST`/etc. handler functions
3. Use `NextRequest`/`NextResponse` from `next/server`
4. Add rate limiting if the endpoint is user-facing and expensive

### Adding a new database model
1. Define model in `prisma/schema.prisma`
2. Run `npx prisma migrate dev --name add_model_name`
3. Run `npx prisma generate`
4. Import Prisma client from `@/lib/prisma`

### Adding a new trading model
1. Add entry to `TRADING_MODELS` array in `src/lib/constants.ts`
2. Seed it in the database via `prisma/seed.ts`
3. Run `npm run db:seed`

### Modifying styles
- Use Tailwind utility classes only
- Custom colors go in `tailwind.config.js` under `theme.extend.colors`
- Rarity-specific styles use the `RARITY_COLORS` and `RARITY_EFFECTS` maps

## Important Constraints

- **Paper trading only**: `PAPER_TRADING_MODE=true` and `REAL_MONEY_ENABLED=false` are enforced. Never add real money trading functionality.
- **Educational disclaimers**: Must appear prominently on every page. Do not remove or hide them.
- **Demo user**: The MVP uses a hardcoded `demo-user` ID — there is no authentication system.
- **Port 3030**: Dev and production servers run on port 3030 (not the default 3000).
- **SQLite locally, PostgreSQL in production**: The Prisma schema uses SQLite as the provider. Production overrides this via `DATABASE_URL` env var pointing to Neon PostgreSQL.
