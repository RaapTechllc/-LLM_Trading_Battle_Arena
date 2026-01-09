# LLM Trading Battle Arena

🤖 **AI models compete in simulated trading battles** - Watch top LLMs like Grok, Claude, and DeepSeek generate collectible trade cards based on their market performance. Educational trading simulation with gamified rewards.

> **⚠️ Educational Disclaimer**: This is a simulated trading arena for educational purposes only. No real money, financial transactions, or actual trading occurs. All trades are simulated for learning and entertainment.

## 🎯 Project Overview

LLM Trading Battle Arena gamifies AI trading performance by turning successful trades into collectible holographic cards. AI models compete through simulated market scenarios, generating rare cards based on their P&L performance that users can collect and showcase.

**Key Features:**
- 🤖 **AI Model Competition**: 6 top LLMs compete in simulated trading scenarios
- 🃏 **Collectible Trade Cards**: P&L performance generates rare holographic cards
- 🏆 **Reward System**: Legendary cards (>10% P&L) unlock special effects and sounds
- 📊 **Performance Tracking**: Real-time leaderboards and model statistics
- 🎮 **Gamified Experience**: Rarity-based visual effects and achievement system
- 📱 **Mobile Responsive**: Optimized for all devices
- 🔒 **Zero Risk**: No real money or financial transactions

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- pnpm 8+
- Git

### Installation
```bash
# Clone the repository
git clone <repository-url>
cd battlecard-arena

# Install dependencies
pnpm install

# Set up database
npx prisma migrate dev

# Start development server
pnpm dev
```

Visit `http://localhost:3000` to start trading!

### Environment Setup
Create `.env.local` file:
```bash
# Database (SQLite for local development)
DATABASE_URL="file:./dev.db"

# Optional: Enable real LLM trading decisions (get key at openrouter.ai)
OPENROUTER_API_KEY="your-key-here"

# Optional: Enable live market prices (enabled by default)
ENABLE_LIVE_PRICES="true"
```

## 🏗️ Architecture

### Tech Stack
- **Frontend**: Next.js 15 App Router, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Server Actions
- **Database**: Prisma ORM with SQLite (local) / Neon PostgreSQL (production)
- **Testing**: Playwright (E2E), Jest (unit tests)
- **Deployment**: Vercel + Neon

### Project Structure
```
src/
├── app/                 # Next.js App Router pages
├── components/          # Reusable UI components
├── lib/                 # Utility functions
└── types/               # TypeScript definitions
prisma/
├── schema.prisma        # Database schema
└── migrations/          # Database migrations
tests/
├── e2e/                 # Playwright tests
└── unit/                # Jest unit tests
docs/                    # Project documentation
```

## 🎮 How to Play

### 1. Simulate a Trade
- Go to `/simulate` and select an AI model (Grok, Claude, DeepSeek, etc.)
- Choose asset (BTC, ETH, SOL), direction (LONG/SHORT), and leverage
- Click "LET AI DECIDE" for LLM-generated trades or "RANDOMIZE" for quick demo
- Submit to generate a collectible trade card

### 2. View Your Journal
- Browse all generated trade cards at `/journal`
- Filter by model, asset, or profit/loss
- Cards have rarity based on P&L: Common (<2%), Rare (2-5%), Epic (5-10%), Legendary (>10%)

### 3. Model Showdown
- Head to `/showdown` for head-to-head AI battles
- Select two models and watch them compete
- Winner determined by total P&L performance

### 4. Check Leaderboard
- View model rankings at `/leaderboard`
- Track win rates, total P&L, and trade counts
- See which AI model dominates the arena

## 🧪 Testing

### Run Tests
```bash
# Unit tests
pnpm test

# E2E tests
pnpm test:e2e

# Test coverage
pnpm test:coverage
```

### Test Coverage
- **Unit Tests**: Component logic and utilities
- **Integration Tests**: API routes and database operations
- **E2E Tests**: Complete user workflows with Playwright

## 🚀 Deployment

### Local Development
- Uses SQLite database (zero configuration)
- Hot reload for rapid development
- No external API keys required

### Production Deployment
1. **Database**: Set up Neon PostgreSQL
2. **Hosting**: Deploy to Vercel
3. **Environment**: Set `DATABASE_URL` environment variable

```bash
# Deploy to Vercel
vercel --prod

# Run database migrations in production
npx prisma migrate deploy
```

## 📖 Documentation

- **[Product Requirements](docs/prd/battlecard-arena.md)**: Detailed feature specifications
- **[Implementation Plan](docs/plans/mvp-implementation.md)**: Development roadmap
- **[Demo Script](docs/demo-script.md)**: Presentation walkthrough
- **[Test Plan](docs/test-plan.md)**: Testing strategy and coverage
- **[Development Log](DEVLOG.md)**: Project timeline and decisions

## 🛠️ Development Workflow

### Using Kiro CLI
This project is optimized for AI-assisted development with Kiro CLI:

```bash
# Load project context
@prime

# Plan new features
@plan-feature

# Execute implementation plans
@execute

# Review code quality
@code-review
```

### Custom Prompts
- `@quickstart`: Project setup wizard
- `@create-prd`: Generate requirements documents
- `@system-review`: Analyze implementation vs plan
- `@code-review-hackathon`: Hackathon submission evaluation

## 🏆 Hackathon Submission

### Judging Criteria
- **Application Quality** (40 pts): Functionality, real-world value, code quality
- **Kiro CLI Usage** (20 pts): Effective use of AI-assisted development
- **Documentation** (20 pts): Completeness, clarity, process transparency
- **Innovation** (15 pts): Uniqueness and creative problem-solving
- **Presentation** (5 pts): Demo video and README quality

### Submission Checklist
- [ ] Application runs locally without external dependencies
- [ ] All core features demonstrated in demo video
- [ ] Educational disclaimers prominently displayed
- [ ] Mobile responsive design verified
- [ ] Playwright tests protect critical user paths
- [ ] Documentation complete and professional
- [ ] DEVLOG shows development process transparency

## 🤝 Contributing

### Development Setup
1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Make changes and test thoroughly
4. Commit with clear messages: `git commit -m 'Add amazing feature'`
5. Push to branch: `git push origin feature/amazing-feature`
6. Open Pull Request

### Code Standards
- TypeScript strict mode
- ESLint + Prettier formatting
- Component-based architecture
- Comprehensive test coverage

## 📄 License

This project is created for the Dynamous Kiro Hackathon. Educational use only.

## 🙏 Acknowledgments

- **Dynamous**: For hosting the Kiro Hackathon
- **Kiro CLI**: For AI-assisted development capabilities
- **Next.js Team**: For the excellent React framework
- **Vercel**: For seamless deployment platform

---

**Ready to battle?** Create your first card and enter the arena! 🃏⚔️

*Remember: This is educational simulation only - no real money involved.*
