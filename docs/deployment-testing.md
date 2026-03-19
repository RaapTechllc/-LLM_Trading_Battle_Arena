# Deployment Testing Guide

This guide covers how to test BattleCard Arena deployments using Playwright to ensure production readiness.

## Quick Start

### Test Local Deployment
```bash
# Full local deployment test
npm run test:deployment:local

# Or run Playwright tests only
npm run test:e2e
```

### Test Production Deployment
```bash
# Test production deployment
npm run test:deployment:production https://your-app.vercel.app

# Or run Playwright tests only
PRODUCTION_URL=https://your-app.vercel.app npm run test:e2e:production
```

## Test Suites

### 1. Golden Path Tests (`golden-path.spec.ts`)
Tests the complete user journey:
- ✅ Card creation with live preview
- ✅ Collection browsing and search
- ✅ Battle system functionality
- ✅ Mobile responsiveness
- ✅ Error handling
- ✅ Navigation flow

### 2. Deployment Tests (`deployment.spec.ts`)
Production-specific validations:
- ✅ Performance (< 2s page load)
- ✅ Database connectivity
- ✅ API endpoint functionality
- ✅ Cross-browser compatibility
- ✅ Educational disclaimers
- ✅ Error resilience

## Configuration

### Environment Variables
- `TEST_ENV=production` - Enables production testing mode
- `PRODUCTION_URL` - Target URL for production tests

### Playwright Config
The configuration automatically switches between local and production modes:
- **Local**: Starts dev server, tests on `localhost:3030`
- **Production**: Tests against provided URL, no local server

## CI/CD Integration

### GitHub Actions
The workflow (`.github/workflows/deployment-testing.yml`) runs:
1. **Local tests** on every push/PR
2. **Production tests** after successful deployment

### Manual Testing Script
Use `scripts/test-deployment.sh` for manual testing:
```bash
# Test local deployment
./scripts/test-deployment.sh local

# Test production deployment
./scripts/test-deployment.sh production https://your-app.vercel.app

# Performance testing only
./scripts/test-deployment.sh performance https://your-app.vercel.app
```

## Test Coverage

### Core Functionality
- [x] Card creation and validation
- [x] Collection management
- [x] Battle system mechanics
- [x] Database operations
- [x] API endpoints

### Production Readiness
- [x] Performance requirements (< 2s load)
- [x] Mobile responsiveness
- [x] Cross-browser compatibility
- [x] Error handling
- [x] Educational disclaimers

### Accessibility & UX
- [x] Navigation flow
- [x] Form usability
- [x] Visual feedback
- [x] Console error checking

## Performance Benchmarks

### Page Load Times (Target: < 2s)
- Home page: < 1s
- Card creation: < 1.5s
- Collection: < 1.5s
- Battle arena: < 2s

### Mobile Responsiveness
Tested on:
- iPhone SE (375x667)
- iPhone 11 (414x896)
- Galaxy S5 (360x640)

## Troubleshooting

### Common Issues

**Tests fail on production but pass locally:**
- Check PRODUCTION_URL is correct
- Verify deployment is complete
- Check for CORS or network issues

**Performance tests fail:**
- Check network conditions
- Verify server resources
- Review database query performance

**Mobile tests fail:**
- Check responsive design breakpoints
- Verify touch interactions work
- Test on actual devices if needed

### Debug Commands
```bash
# Run tests with browser visible
npm run test:e2e:headed

# Run specific test file
npx playwright test tests/e2e/deployment.spec.ts

# Generate test report
npx playwright show-report
```

## Best Practices

### Before Deployment
1. Run full local test suite
2. Verify all tests pass
3. Check performance benchmarks
4. Review test coverage

### After Deployment
1. Run production test suite
2. Verify performance metrics
3. Test on multiple browsers
4. Check mobile experience

### Continuous Monitoring
- Set up automated production testing
- Monitor performance metrics
- Track error rates
- Review user feedback

## Integration with Vercel

### Deployment Hooks
Add to `vercel.json` for automatic testing:
```json
{
  "github": {
    "autoJobCancelation": false
  },
  "functions": {
    "app/api/**/*.ts": {
      "maxDuration": 10
    }
  }
}
```

### Environment Variables
Set in Vercel dashboard:
- `DATABASE_URL` - Neon PostgreSQL connection string

## Reporting

### Test Results
- HTML reports generated in `playwright-report/`
- Screenshots and videos for failed tests
- Performance metrics logged

### CI/CD Integration
- GitHub Actions artifacts
- PR comments with test results
- Deployment status updates

---

## Quick Reference

| Command | Purpose |
|---------|---------|
| `npm run test:e2e` | Local Playwright tests |
| `npm run test:e2e:production` | Production Playwright tests |
| `npm run test:deployment:local` | Full local deployment test |
| `npm run test:deployment:production <URL>` | Full production test |
| `npx playwright show-report` | View test results |

**Ready to deploy with confidence!** 🚀
