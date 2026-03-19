# LLM Arena Phase 1 Migration Guide

**From:** SQLite prototype  
**To:** PostgreSQL with NextAuth  
**Date:** 2026-02-12

---

## Quick Start (Local Development)

### 1. Start PostgreSQL
```bash
# Option A: Docker Compose (recommended)
docker compose -f docker-compose.dev.yml up -d db

# Option B: Existing PostgreSQL
# Ensure you have PostgreSQL 16+ running on port 5432
```

### 2. Configure Environment
```bash
# Copy example and fill in values
cp .env.example .env

# REQUIRED: Database URL (if using Docker Compose, use default)
DATABASE_URL="postgresql://arena:arena@localhost:5432/arena"

# REQUIRED: NextAuth secret (generate with command below)
openssl rand -base64 32  # Copy output to NEXTAUTH_SECRET

# OPTIONAL (for OAuth - can skip for now, app will run without it)
# GOOGLE_CLIENT_ID=...
# GOOGLE_CLIENT_SECRET=...
# GITHUB_ID=...
# GITHUB_SECRET=...
```

### 3. Run Database Migration
```bash
# Generate Prisma Client
npx prisma generate

# Create database schema
npx prisma migrate dev --name init

# Seed initial data (trading models)
npm run db:seed
```

### 4. Start Development Server
```bash
npm run dev
```

App will run on http://localhost:3030

---

## OAuth Setup (Optional)

### Google OAuth
1. Go to: https://console.cloud.google.com/apis/credentials
2. Create OAuth 2.0 Client ID
3. Add authorized redirect URI:
   ```
   http://localhost:3030/api/auth/callback/google
   ```
4. Copy Client ID and Secret to `.env`:
   ```bash
   GOOGLE_CLIENT_ID=your-client-id
   GOOGLE_CLIENT_SECRET=your-client-secret
   ```

### GitHub OAuth
1. Go to: https://github.com/settings/developers
2. Create New OAuth App
3. Authorization callback URL:
   ```
   http://localhost:3030/api/auth/callback/github
   ```
4. Copy Client ID and Secret to `.env`:
   ```bash
   GITHUB_ID=your-client-id
   GITHUB_SECRET=your-client-secret
   ```

---

## Docker Development

### Full Stack (Database + App)
```bash
# Start everything
docker compose -f docker-compose.dev.yml up

# View logs
docker compose -f docker-compose.dev.yml logs -f app

# Stop
docker compose -f docker-compose.dev.yml down

# Clean (removes volumes)
docker compose -f docker-compose.dev.yml down -v
```

### Database Only
```bash
# Just PostgreSQL (then run app locally)
docker compose -f docker-compose.dev.yml up -d db

# Connect to database
docker compose -f docker-compose.dev.yml exec db psql -U arena -d arena
```

---

## Database Commands

### Prisma Studio (Database GUI)
```bash
npx prisma studio
```
Opens at http://localhost:5555

### View Schema
```bash
npx prisma db pull  # Pull schema from database
npx prisma db push  # Push schema changes (dev only)
```

### Reset Database
```bash
npx prisma migrate reset  # WARNING: Deletes all data
npm run db:seed           # Re-seed trading models
```

### SQL Access
```bash
# Via Docker
docker compose -f docker-compose.dev.yml exec db psql -U arena -d arena

# Direct connection (if running locally)
psql postgresql://arena:arena@localhost:5432/arena
```

---

## Production Deployment

### Prerequisites
1. PostgreSQL 16+ (Neon, Supabase, AWS RDS, etc.)
2. Node.js 22+ runtime
3. OAuth credentials (Google + GitHub)
4. NextAuth secret

### Environment Variables
```bash
DATABASE_URL="postgresql://user:pass@host:5432/db?sslmode=require"
NEXTAUTH_SECRET="<32-byte-base64-string>"
NEXTAUTH_URL="https://yourdomain.com"
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."
GITHUB_ID="..."
GITHUB_SECRET="..."
OPENROUTER_API_KEY="sk-or-v1-..."
```

### Build & Deploy
```bash
# Install dependencies
npm ci

# Generate Prisma Client
npx prisma generate

# Run migrations (production)
npx prisma migrate deploy

# Build Next.js
npm run build

# Start production server
npm start
```

### Docker Production
```bash
# Build image
docker build -t llm-arena:latest .

# Run container
docker run -p 3030:3030 \
  -e DATABASE_URL="..." \
  -e NEXTAUTH_SECRET="..." \
  -e NEXTAUTH_URL="..." \
  llm-arena:latest
```

---

## Troubleshooting

### Build Error: "Type 'undefined' is not assignable to type 'string'"
**Solution:** Already fixed in Phase 1. Run `npm run build` to verify.

### Migration Error: "relation already exists"
**Solution:** Database has leftover tables from previous run.
```bash
# Option A: Reset everything
npx prisma migrate reset

# Option B: Drop database manually
docker compose down -v  # If using Docker
```

### NextAuth Error: "NEXTAUTH_SECRET is not set"
**Solution:** Generate secret and add to `.env`
```bash
openssl rand -base64 32
```

### OAuth Error: "redirect_uri_mismatch"
**Solution:** Ensure OAuth provider's redirect URI matches exactly:
- Local: `http://localhost:3030/api/auth/callback/google`
- Production: `https://yourdomain.com/api/auth/callback/google`

### Database Connection Error
**Solution:** Check DATABASE_URL format:
```bash
# Local Docker
postgresql://arena:arena@localhost:5432/arena

# Remote (Neon, Supabase)
postgresql://user:pass@host:5432/db?sslmode=require
```

---

## What Changed in Phase 1

### Database
- ✅ SQLite → PostgreSQL
- ✅ 8 new models: User, Account, Session, AccountBalance, Position, Order, RiskEvent, AuditLog
- ✅ `userId` added to TradeCard and ModelBattle

### Auth
- ✅ NextAuth.js with Google + GitHub OAuth
- ✅ Middleware protects all routes except public
- ✅ Session includes `user.id`

### Services
- ✅ TradingService (order submission, position management)
- ✅ RiskManager (position limits, circuit breaker)
- ✅ AuditLogger (append-only audit trail)

### UI
- ✅ `/account` page (view balance)
- ✅ API route: `GET /api/account/balance`

### Infrastructure
- ✅ Docker Compose dev environment
- ✅ Dockerfile for production builds

---

## Need Help?

**Documentation:**
- NextAuth: https://authjs.dev/
- Prisma: https://www.prisma.io/docs
- Next.js: https://nextjs.org/docs

**Common Commands:**
```bash
npm run dev             # Start dev server
npm run build           # Build for production
npm run db:seed         # Seed database
npx prisma studio       # Open database GUI
npx prisma migrate dev  # Create new migration
docker compose logs -f  # View logs
```

---

**Ready to build!** 🚀
