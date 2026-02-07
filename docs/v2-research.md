# LLM Trading Battle Arena V2 - Research & Roadmap

## Project Pivot: From Hackathon Demo → Personal Passion Project

**New Vision:** A live trading platform that:
1. Tracks LLM model intelligence in real trading scenarios
2. Monitors politician stock trades (STOCK Act data)
3. Provides nof1.ai-style clean UI
4. Mobile-first design

---

## 1. nof1.ai Architecture Analysis

### How nof1.ai Works
- **Real USDC on Hyperliquid** - Each LLM gets $10K real capital
- **On-chain verifiable trades** - All trades are public and auditable
- **LLM reasoning exposed** - Users can see why each model made its decision
- **Models tracked:** GPT-5, Claude 4.5, Gemini 2.5 Pro, Grok 4, DeepSeek V3.1, Qwen 3 Max

### Tech Stack (Reverse-engineered)
- Next.js 14/15
- Prisma ORM
- PostgreSQL (Neon)
- Redis (Upstash) for rate limiting/caching
- Vercel hosting
- Hyperliquid Python SDK for trade execution

### Key Features to Replicate
- [ ] Real-time position tracking
- [ ] LLM reasoning display
- [ ] Performance metrics (Sharpe ratio, drawdown, win rate)
- [ ] Model comparison dashboard
- [ ] Historical trade replay

---

## 2. Hyperliquid Integration

### Official SDKs
- **Python:** https://github.com/hyperliquid-dex/hyperliquid-python-sdk
- **Rust:** https://github.com/infinitefield/hypersdk
- **TypeScript:** https://github.com/nktkas/hyperliquid
- **CCXT:** https://docs.ccxt.com/#/exchanges/hyperliquid

### Integration Steps
1. Create API wallet on Hyperliquid (separate from main wallet)
2. Fund with USDC (testnet first, then mainnet)
3. Use Python SDK for backend trade execution
4. Implement position tracking via WebSocket

### Order Types Supported
- Limit orders
- Market orders
- Take-profit / Stop-loss
- Reduce-only orders

### Testnet vs Mainnet
- Testnet: https://app.hyperliquid-testnet.xyz
- Mainnet: https://app.hyperliquid.xyz
- Same API, different endpoints

---

## 3. Politician Trade Tracking

### Data Sources
| Source | Type | Pricing | Notes |
|--------|------|---------|-------|
| **Quiver Quantitative** | API | Free tier available | Best for Congress trades |
| **Financial Modeling Prep** | API | Paid | Senate + House trades |
| **AInvest API** | API | Paid | STOCK Act disclosures |
| **Apify Actor** | Scraper | Pay-per-run | Direct from disclosure sites |
| **House.gov Disclosures** | Raw | Free | Manual parsing needed |
| **Senate.gov eFD** | Raw | Free | Manual parsing needed |

### Key Politicians to Track
- Nancy Pelosi (legendary returns)
- Dan Crenshaw
- Tommy Tuberville
- Mark Green
- Josh Gottheimer

### Features to Build
- [ ] Congress trade feed (real-time alerts)
- [ ] Performance by politician
- [ ] Copy-trading alerts
- [ ] Sector analysis (what sectors are they buying?)
- [ ] Timing analysis (when do they trade?)

### Legal Considerations
- All data is public (STOCK Act requires disclosure)
- Educational/informational use is legal
- Don't offer "investment advice" - keep it informational
- Add clear disclaimers

---

## 4. UI/UX Revamp

### Current State (Hackathon Theme)
- Heavy gamification (holographic cards, achievements)
- Playful animations
- Gaming-focused color scheme

### Target State (nof1.ai Style)
- Clean, professional dashboard
- Data-dense but readable
- Mobile-first responsive
- Dark mode primary
- Minimal animations (subtle micro-interactions only)

### Key UI Patterns from nof1.ai
1. **Model cards** - Photo/avatar, name, current position, P&L
2. **Position table** - Entry, size, leverage, unrealized P&L
3. **Trade history** - Chronological feed with reasoning
4. **Leaderboard** - Sortable by various metrics
5. **Chart integration** - TradingView or similar

### Mobile Priorities
- Responsive grid (1-2 columns on mobile)
- Touch-friendly controls
- Bottom navigation bar
- Collapsible sections

---

## 5. Architecture Decisions

### Backend Changes Needed
```
Current: Next.js API routes (Node.js)
New: Add Python service for Hyperliquid trading

Architecture:
┌─────────────────────────────────────┐
│         Next.js Frontend            │
│    (React, TailwindCSS, Prisma)    │
└──────────────┬──────────────────────┘
               │ REST/WebSocket
┌──────────────▼──────────────────────┐
│      Python Trading Service         │
│  (Hyperliquid SDK, Trade Execution) │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│         Hyperliquid DEX             │
│      (Testnet → Mainnet)            │
└─────────────────────────────────────┘
```

### Database Schema Additions
```prisma
model PoliticianTrade {
  id            String   @id @default(cuid())
  politicianId  String
  politician    Politician @relation(...)
  ticker        String
  action        String   // BUY, SELL
  amount        String   // Range from disclosure
  disclosedAt   DateTime
  tradedAt      DateTime
  source        String   // house.gov, senate.gov
}

model Politician {
  id          String   @id @default(cuid())
  name        String
  chamber     String   // HOUSE, SENATE
  state       String
  party       String
  trades      PoliticianTrade[]
}
```

---

## 6. Implementation Phases

### Phase 1: UI Revamp (2-3 days)
- [ ] Remove hackathon theming (cards, achievements)
- [ ] Implement nof1-style dashboard layout
- [ ] Add mobile responsive breakpoints
- [ ] Clean up navigation

### Phase 2: Hyperliquid Integration (3-5 days)
- [ ] Set up Python trading service
- [ ] Implement paper trading on testnet
- [ ] Add position tracking
- [ ] Wire LLM decisions to trade execution

### Phase 3: Politician Tracking (2-3 days)
- [ ] Integrate Quiver Quantitative API (or alternative)
- [ ] Build politician feed UI
- [ ] Add alerting system
- [ ] Performance tracking

### Phase 4: Polish & Launch (2-3 days)
- [ ] Performance optimization
- [ ] Error handling
- [ ] Monitoring/alerting
- [ ] Documentation

---

## 7. API Keys Needed

| Service | Purpose | Status |
|---------|---------|--------|
| OpenRouter | LLM trading decisions | ✅ Have |
| Hyperliquid | Trade execution | ❌ Need wallet setup |
| Quiver Quantitative | Congress trades | ❌ Need account |
| Financial Modeling Prep | Alternative congress data | ❌ Optional |
| Neon | Production PostgreSQL | ❌ Need account |
| Upstash | Redis rate limiting | ❌ Optional |

---

## 8. Competitor Analysis

### nof1.ai (Alpha Arena)
- **Strength:** Real trading, verifiable on-chain
- **Weakness:** Limited to crypto, no politician tracking

### Autopilot (joinautopilot.com)
- **Strength:** Actual copy-trading execution
- **Weakness:** Requires brokerage integration

### Quiver Quantitative
- **Strength:** Comprehensive congress data
- **Weakness:** UI is data-heavy, not mobile-friendly

### Our Differentiation
1. **Combine LLM trading + politician tracking** (no one does both)
2. **Better mobile experience than competitors**
3. **Open reasoning** (show why LLMs and politicians trade)

---

## Next Steps

1. **Immediate:** Strip hackathon theme, implement clean dashboard
2. **This week:** Set up Hyperliquid testnet integration
3. **Next week:** Add politician trade tracking
4. **Ongoing:** Iterate based on Kyle's feedback

---

*Research compiled by TopG - 2026-02-07*
