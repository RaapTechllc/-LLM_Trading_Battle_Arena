import { test, expect } from '@playwright/test';

test.describe('Deployment Testing', () => {
  test('production deployment health check', async ({ page }) => {
    // Navigate to home page
    await page.goto('/');
    
    // Verify page loads within performance requirements
    const startTime = Date.now();
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - startTime;
    
    // Should load in under 2 seconds (2000ms)
    expect(loadTime).toBeLessThan(2000);
    
    // Verify core elements are present
    await expect(page.getByText('🃏 BattleCard Arena')).toBeVisible();
    await expect(page.getByText('Educational Disclaimer')).toBeVisible();
    await expect(page.getByText('Create Your First Battle Card')).toBeVisible();
    
    // Verify navigation menu is functional
    await expect(page.getByText('Create Card')).toBeVisible();
    await expect(page.getByText('Collection')).toBeVisible();
    await expect(page.getByText('Battle')).toBeVisible();
  });

  test('database connectivity and API endpoints', async ({ page }) => {
    // Test card creation API
    await page.goto('/create-card');
    
    // Fill out card form
    await page.fill('input[placeholder="Enter card name..."]', 'Deployment Test Card');
    await page.fill('input[placeholder="Brief card description..."]', 'Testing deployment');
    
    // Submit card and verify API works
    await page.click('button:has-text("Create Battle Card")');
    await expect(page.getByText('Card created successfully!')).toBeVisible();
    
    // Test collection API
    await page.goto('/collection');
    await expect(page.getByText('Deployment Test Card')).toBeVisible();
    
    // Test battle API
    await page.goto('/battle');
    await expect(page.getByText('Select Your Battle Deck')).toBeVisible();
  });

  test('mobile responsiveness on production', async ({ page }) => {
    // Test various mobile viewports
    const viewports = [
      { width: 375, height: 667 }, // iPhone SE
      { width: 414, height: 896 }, // iPhone 11
      { width: 360, height: 640 }, // Galaxy S5
    ];

    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      await page.goto('/');
      
      // Verify mobile layout
      await expect(page.getByText('🃏 BattleCard Arena')).toBeVisible();
      await expect(page.getByText('Create Your First Battle Card')).toBeVisible();
      
      // Test navigation on mobile
      await page.click('text=Create Card');
      await expect(page).toHaveURL('/create-card');
      
      // Verify form is usable on mobile
      await expect(page.locator('input[placeholder="Enter card name..."]')).toBeVisible();
    }
  });

  test('performance and accessibility', async ({ page }) => {
    await page.goto('/');
    
    // Check for console errors
    const consoleErrors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    // Navigate through all main pages
    const pages = ['/create-card', '/collection', '/battle'];
    
    for (const pagePath of pages) {
      await page.goto(pagePath);
      await page.waitForLoadState('networkidle');
      
      // Verify no JavaScript errors
      expect(consoleErrors.length).toBe(0);
      
      // Basic accessibility checks
      await expect(page.locator('h1, h2, h3').first()).toBeVisible();
      await expect(page.locator('main, [role="main"]').first()).toBeVisible();
    }
  });

  test('educational disclaimers are prominent', async ({ page }) => {
    await page.goto('/');
    
    // Verify educational disclaimer is visible and prominent
    const disclaimer = page.getByText('Educational Disclaimer');
    await expect(disclaimer).toBeVisible();
    
    // Check disclaimer styling (should be prominent)
    const disclaimerBox = page.locator('div:has-text("Educational Disclaimer")').first();
    await expect(disclaimerBox).toBeVisible();
    
    // Verify key phrases are present
    await expect(page.getByText('paper trading simulation')).toBeVisible();
    await expect(page.getByText('no real money')).toBeVisible();
    await expect(page.getByText('educational purposes only')).toBeVisible();
  });

  test('cross-browser compatibility', async ({ browserName, page }) => {
    await page.goto('/');
    
    // Test core functionality works across browsers
    await expect(page.getByText('🃏 BattleCard Arena')).toBeVisible();
    
    // Test card creation works in all browsers
    await page.click('text=Create Your First Battle Card');
    await page.fill('input[placeholder="Enter card name..."]', `${browserName} Test Card`);
    await page.fill('input[placeholder="Brief card description..."]', `Testing in ${browserName}`);
    
    // Verify form submission works
    await page.click('button:has-text("Create Battle Card")');
    await expect(page.getByText('Card created successfully!')).toBeVisible();
    
    // Verify collection displays correctly
    await page.goto('/collection');
    await expect(page.getByText(`${browserName} Test Card`)).toBeVisible();
  });

  test('error handling and resilience', async ({ page }) => {
    // Test navigation to non-existent pages
    const response = await page.goto('/non-existent-page');
    expect(response?.status()).toBe(404);
    
    // Test form validation
    await page.goto('/create-card');
    
    // Try to submit empty form
    await page.click('button:has-text("Create Battle Card")');
    await expect(page.locator('button:has-text("Create Battle Card")')).toBeDisabled();
    
    // Test battle with no cards selected
    await page.goto('/battle');
    const startButton = page.locator('button:has-text("Start Battle!")');
    if (await startButton.isVisible()) {
      await expect(startButton).toBeDisabled();
    }
  });
});
