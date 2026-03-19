import { test, expect } from '@playwright/test';

test.describe('Demo Rehearsal Flow', () => {
  test('complete demo journey should work end-to-end', async ({ page }) => {
    // Start timing
    const startTime = Date.now();
    
    // 1. Home Page (30s target)
    await page.goto('/');
    await expect(page.locator('text=LLM Trading')).toBeVisible();
    await expect(page.locator('text=Educational Disclaimer')).toBeVisible();
    
    // 2. Simulate Page (45s target)
    await page.click('text=SIMULATE ALPHA');
    await expect(page.locator('h1')).toContainText('AI Trade Simulator');
    
    // Click randomize to fill form
    await page.click('text=RANDOMIZE');
    
    // Generate trade card
    await page.click('text=SYNC LEDGER');
    await expect(page.locator('text=GENERATED')).toBeVisible({ timeout: 10000 });
    
    // 3. Journal Page (30s target)
    await page.click('text=Journal');
    await expect(page.locator('text=Educational Collection')).toBeVisible();
    
    // 4. Showdown Page (60s target)
    await page.click('text=Showdown');
    await expect(page.locator('text=Model Showdown')).toBeVisible();
    
    // 5. Leaderboard Page (15s target)
    await page.click('text=Leaderboard');
    await expect(page.locator('text=Simulated Performance')).toBeVisible();
    
    // Calculate total time
    const totalTime = Date.now() - startTime;
    const totalSeconds = totalTime / 1000;
    
    console.log(`Demo completed in ${totalSeconds.toFixed(1)} seconds`);
    
    // Demo should complete in under 3 minutes (180 seconds)
    expect(totalSeconds).toBeLessThan(180);
  });

  test('mobile responsiveness during demo', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Test key pages on mobile
    const pages = ['/', '/simulate', '/journal', '/showdown', '/leaderboard'];
    
    for (const pagePath of pages) {
      await page.goto(pagePath);
      
      // Check that page loads and is responsive
      await expect(page.locator('body')).toBeVisible();
      
      // Check that navigation is accessible
      await expect(page.locator('nav')).toBeVisible();
    }
  });
});
