# BattleCard Arena - MVP Implementation Plan

## Overview
This plan outlines the minimal viable product implementation for BattleCard Arena, focusing on core functionality that can be built and demonstrated within hackathon timeframes.

## Phase 1: Foundation (Day 1)
### Database Schema
```prisma
model Card {
  id          String   @id @default(cuid())
  name        String
  attack      Int
  defense     Int
  health      Int
  ability     String?
  rarity      Rarity
  createdAt   DateTime @default(now())
  userId      String?  // Optional for MVP
}

enum Rarity {
  COMMON
  RARE
  EPIC
  LEGENDARY
}
```

### Core Routes
- `/` - Landing page with disclaimers
- `/create` - Card creation form
- `/collection` - Card library view
- `/battle` - Battle interface (stub)

### Components Architecture
```
components/
├── ui/
│   ├── Button.tsx
│   ├── Card.tsx
│   └── Input.tsx
├── cards/
│   ├── CardCreator.tsx
│   ├── CardDisplay.tsx
│   └── CardList.tsx
└── layout/
    ├── Header.tsx
    └── Footer.tsx
```

## Phase 2: Card Creation (Day 2)
### Features
- Visual card creation form
- Real-time preview
- Stat validation (1-10 range)
- Ability text input (max 100 chars)
- Rarity selection
- Save to database

### Implementation Tasks
1. Create CardCreator component with form
2. Add form validation with Zod
3. Implement card preview with live updates
4. Add Server Action for card creation
5. Style with Tailwind for visual appeal

### Acceptance Criteria
- User can input card name, stats, and ability
- Preview updates in real-time
- Form validates input ranges
- Card saves to SQLite database
- Success feedback after creation

## Phase 3: Collection Management (Day 3)
### Features
- Display all created cards
- Search by name
- Filter by rarity
- Card detail view
- Delete cards

### Implementation Tasks
1. Create CardList component with grid layout
2. Add search functionality
3. Implement rarity filter dropdown
4. Create card detail modal/page
5. Add delete functionality with confirmation

### Acceptance Criteria
- All cards display in responsive grid
- Search works by card name
- Filter shows only selected rarity
- Card details show full information
- Delete removes card from database

## Phase 4: Basic Battle System (Day 4)
### Features
- Simple turn-based combat
- AI opponent with random cards
- Health tracking
- Win/loss determination
- Battle history

### Implementation Tasks
1. Create Battle component with game state
2. Implement turn logic (attack/defend)
3. Add AI opponent with basic strategy
4. Track battle outcomes
5. Display battle results

### Battle Mechanics
- Each player starts with 3 random cards
- Players take turns playing cards
- Card attack reduces opponent health
- First to 0 health loses
- Simple damage calculation: Attack - Defense

## Phase 5: Polish & Testing (Day 5)
### Features
- Responsive design improvements
- Loading states
- Error handling
- Playwright test coverage
- Performance optimization

### Implementation Tasks
1. Add loading spinners and skeletons
2. Implement error boundaries
3. Write Playwright tests for golden path
4. Optimize database queries
5. Add educational disclaimers throughout

### Test Coverage
- Card creation flow
- Collection browsing
- Battle initiation
- Mobile responsiveness
- Error scenarios

## Technical Implementation Details

### Database Operations
```typescript
// Card creation
async function createCard(data: CardInput) {
  return await prisma.card.create({ data });
}

// Get user cards
async function getUserCards(userId?: string) {
  return await prisma.card.findMany({
    where: userId ? { userId } : {},
    orderBy: { createdAt: 'desc' }
  });
}
```

### State Management
- React useState for component state
- Server Actions for mutations
- No external state management needed for MVP

### Styling Approach
- Tailwind utility classes only
- Responsive design with mobile-first
- Card-like visual design with shadows/borders
- Consistent color scheme (blues/purples for fantasy theme)

## Deployment Strategy
### Local Development
- SQLite database (zero config)
- pnpm dev for hot reload
- No environment variables required

### Production Deployment
- Vercel for hosting
- Neon PostgreSQL for database
- Environment variable: DATABASE_URL only

## Risk Mitigation
- **Scope creep**: Stick to MVP features only
- **Technical complexity**: Use simple battle mechanics
- **Time constraints**: Mock complex features if needed
- **Demo failures**: Playwright tests protect critical paths

## Success Criteria
- [ ] User can create cards in under 2 minutes
- [ ] Collection displays all cards correctly
- [ ] Battle system works end-to-end
- [ ] Mobile experience is fully functional
- [ ] Playwright tests pass consistently
- [ ] Application deploys to Vercel successfully

## Next Steps After MVP
1. Multiplayer battles with WebSocket
2. Advanced card abilities and effects
3. Deck building and strategy
4. User authentication and profiles
5. Card trading marketplace
6. Tournament system
