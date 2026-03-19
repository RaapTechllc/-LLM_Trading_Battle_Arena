# BattleCard Arena - Test Plan

## Testing Strategy Overview
Comprehensive testing approach covering unit tests, integration tests, and end-to-end testing to ensure application reliability and user experience quality.

## Test Categories

### 1. Unit Tests (Jest + React Testing Library)
**Scope**: Individual components and utility functions
**Location**: `tests/unit/`

#### Component Tests
- **CardCreator.test.tsx**
  - Form validation with invalid inputs
  - Real-time preview updates
  - Successful card creation
  - Error handling for API failures

- **CardDisplay.test.tsx**
  - Renders card information correctly
  - Handles missing/null data gracefully
  - Rarity styling applies correctly

- **CardList.test.tsx**
  - Displays cards in grid layout
  - Search functionality filters correctly
  - Rarity filter works as expected
  - Empty state shows appropriate message

#### Utility Tests
- **cardUtils.test.ts**
  - Stat validation functions
  - Rarity color mapping
  - Battle damage calculations

### 2. Integration Tests (Jest)
**Scope**: API routes and database operations
**Location**: `tests/integration/`

#### API Route Tests
- **POST /api/cards**
  - Creates card with valid data
  - Rejects invalid input
  - Returns proper error codes
  - Handles database errors

- **GET /api/cards**
  - Returns all cards
  - Filters by query parameters
  - Handles empty database
  - Proper error responses

#### Database Tests
- **Card CRUD operations**
  - Create, read, update, delete cards
  - Data integrity constraints
  - Relationship handling

### 3. End-to-End Tests (Playwright)
**Scope**: Complete user workflows
**Location**: `tests/e2e/`

#### Critical User Paths
- **Golden Path Test** (`golden-path.spec.ts`)
  - Navigate to landing page
  - Verify disclaimers are visible
  - Create a new battle card
  - View card in collection
  - Start a battle
  - Complete battle flow

- **Card Creation Flow** (`card-creation.spec.ts`)
  - Fill out card creation form
  - Verify real-time preview
  - Submit and save card
  - Verify card appears in collection

- **Collection Management** (`collection.spec.ts`)
  - Browse card collection
  - Search for specific cards
  - Filter by rarity
  - View card details

- **Battle System** (`battle.spec.ts`)
  - Start battle with AI
  - Play cards in turns
  - Complete battle
  - View battle results

#### Cross-Browser Testing
- Chrome (primary)
- Firefox
- Safari (if available)
- Edge

#### Mobile Testing
- iPhone viewport (375x667)
- Android viewport (360x640)
- Tablet viewport (768x1024)

### 4. Visual Regression Tests
**Scope**: UI consistency across changes
**Tool**: Playwright screenshots

#### Screenshot Tests
- Landing page
- Card creation form
- Collection grid
- Battle interface
- Mobile layouts

## Test Data Management

### Test Database
- In-memory SQLite for unit/integration tests
- Isolated test database for E2E tests
- Seed data for consistent testing

### Mock Data
```typescript
const mockCard = {
  id: 'test-card-1',
  name: 'Test Dragon',
  attack: 5,
  defense: 3,
  health: 8,
  ability: 'Test ability',
  rarity: 'RARE',
  createdAt: new Date()
};
```

## Performance Testing

### Load Testing
- Page load times under 2 seconds
- Form submission response times
- Database query performance

### Accessibility Testing
- Screen reader compatibility
- Keyboard navigation
- Color contrast ratios
- ARIA labels and roles

## Test Automation

### CI/CD Pipeline
```yaml
# GitHub Actions workflow
- Run unit tests
- Run integration tests
- Run E2E tests in headless mode
- Generate test coverage report
- Upload Playwright test results
```

### Pre-commit Hooks
- Run unit tests
- Lint code
- Type checking

## Test Coverage Goals
- **Unit Tests**: 80% code coverage
- **Integration Tests**: All API routes covered
- **E2E Tests**: All critical user paths covered
- **Component Tests**: All interactive components tested

## Test Execution

### Local Development
```bash
# Run all tests
pnpm test

# Run unit tests only
pnpm test:unit

# Run E2E tests
pnpm test:e2e

# Run tests in watch mode
pnpm test:watch
```

### CI Environment
```bash
# Install dependencies
pnpm install

# Run database migrations
npx prisma migrate dev

# Run all tests with coverage
pnpm test:ci

# Run E2E tests headless
pnpm test:e2e:ci
```

## Error Scenarios Testing

### Network Failures
- API timeout handling
- Connection loss during form submission
- Offline functionality (if applicable)

### Data Validation
- Invalid form inputs
- SQL injection attempts
- XSS prevention

### Edge Cases
- Empty database states
- Maximum input lengths
- Concurrent user actions

## Monitoring & Reporting

### Test Reports
- Jest coverage reports
- Playwright HTML reports
- Visual diff reports
- Performance metrics

### Failure Handling
- Screenshot capture on E2E failures
- Error logs and stack traces
- Retry mechanisms for flaky tests

## Maintenance

### Test Review Process
- Regular test case review
- Update tests for new features
- Remove obsolete tests
- Performance optimization

### Test Data Cleanup
- Clear test database after runs
- Remove temporary files
- Reset application state

## Success Criteria
- [ ] All tests pass consistently
- [ ] 80%+ code coverage achieved
- [ ] Critical user paths protected
- [ ] Mobile experience tested
- [ ] Cross-browser compatibility verified
- [ ] Performance benchmarks met
- [ ] Accessibility standards followed
