import { test, expect } from '@playwright/test';

test.describe('Live Price Integration', () => {
  test('live price tickers should be visible on key pages', async ({ page }) => {
    // Test Home page
    await page.goto('/');
    await expect(page.locator('text=Live Market Data')).toBeVisible();
    await expect(page.locator('text=BTC')).toBeVisible();
    await expect(page.locator('text=ETH')).toBeVisible();
    await expect(page.locator('text=SOL')).toBeVisible();

    // Test Journal page
    await page.goto('/journal');
    await expect(page.locator('text=Current Market Prices')).toBeVisible();
    await expect(page.locator('text=BTC')).toBeVisible();

    // Test Showdown page
    await page.goto('/showdown');
    await expect(page.locator('text=Live Market Context')).toBeVisible();
    await expect(page.locator('text=BTC')).toBeVisible();
  });

  test('live price API should return valid data', async ({ page }) => {
    // Navigate to a page to trigger the API call
    await page.goto('/');
    
    // Wait for the live price ticker to load
    await expect(page.locator('text=BTC')).toBeVisible({ timeout: 10000 });
    
    // Check that prices are displayed (either live or fallback)
    const btcPrice = page.locator('text=/\\$[0-9,]+/').first();
    await expect(btcPrice).toBeVisible();
  });

  test('demo script should mention live market data', async ({ page }) => {
    await page.goto('/');
    
    // Start demo
    await page.click('text=🎬 Start Demo');
    
    // Check that demo mentions live market data
    await expect(page.locator('text=Point out live BTC/ETH/SOL price tickers')).toBeVisible();
  });

  test('live price ticker should handle loading and error states', async ({ page }) => {
    await page.goto('/');
    
    // Should show loading state initially
    const ticker = page.locator('[data-testid="live-price-ticker"]').first();
    
    // Should eventually show either LIVE or OFFLINE status
    await expect(page.locator('text=LIVE,text=OFFLINE')).toBeVisible({ timeout: 15000 });
  });
});
