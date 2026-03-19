import { test, expect } from '@playwright/test';

test.describe('LLM Trading Arena - Golden Path', () => {
  test('complete user journey: simulate trade → view journal → showdown', async ({ page }) => {
    // Start at home page
    await page.goto('/');
    
    // Verify educational disclaimer is visible
    await expect(page.locator('text=Educational Disclaimer')).toBeVisible();
    
    // Navigate to simulate
    await page.click('text=SIMULATE ALPHA');
    await expect(page).toHaveURL('/simulate');
    await expect(page.locator('h1')).toContainText('AI Trade Simulator');
    
    // Verify disclaimer on simulate page
    await expect(page.locator('text=Simulated Trading Only')).toBeVisible();
    
    // Generate a random trade
    await page.click('text=RANDOMIZE');
    
    // Submit the trade
    await page.click('text=SYNC LEDGER');
    await expect(page.locator('text=GENERATED')).toBeVisible({ timeout: 10000 });
    
    // Navigate to journal
    await page.click('text=Journal');
    await expect(page).toHaveURL('/journal');
    await expect(page.locator('text=Educational Collection')).toBeVisible();
    
    // Navigate to showdown
    await page.click('text=Showdown');
    await expect(page).toHaveURL('/showdown');
    await expect(page.locator('text=Simulated Competition')).toBeVisible();
    
    // Navigate to leaderboard
    await page.click('text=Leaderboard');
    await expect(page).toHaveURL('/leaderboard');
    await expect(page.locator('text=Simulated Performance')).toBeVisible();
  });

  test('mobile responsiveness', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto('/');
    await expect(page.locator('text=LLM Trading')).toBeVisible();
    
    // Test simulate on mobile
    await page.click('text=SIMULATE ALPHA');
    await expect(page.locator('h1')).toContainText('AI Trade Simulator');
    
    // Verify form is usable on mobile
    await page.click('text=RANDOMIZE');
    await expect(page.locator('select').first()).toBeVisible();
  });

  test('AI trade generation fallback', async ({ page }) => {
    await page.goto('/simulate');
    
    // Click AI generate (should fallback if no API key)
    await page.click('text=LET AI DECIDE');
    
    // Should either show AI generated or fallback message
    await expect(
      page.locator('text=AI GENERATED').or(page.locator('text=AI UNAVAILABLE'))
    ).toBeVisible({ timeout: 35000 });
  });

  test('navigation flow', async ({ page }) => {
    await page.goto('/');
    
    // Test all navigation links
    await page.click('text=Simulate');
    await expect(page).toHaveURL('/simulate');
    
    await page.click('text=Journal');
    await expect(page).toHaveURL('/journal');
    
    await page.click('text=Showdown');
    await expect(page).toHaveURL('/showdown');
    
    await page.click('text=Leaderboard');
    await expect(page).toHaveURL('/leaderboard');
    
    // Test logo link back to home
    await page.click('text=⚔️');
    await expect(page).toHaveURL('/');
  });

  test('losing trade (negative pnl) should be accepted', async ({ page }) => {
    await page.goto('/simulate');
    
    // Set up a losing trade manually
    await page.selectOption('select[name="direction"]', 'LONG');
    await page.fill('input[name="entryPrice"]', '100000');
    await page.fill('input[name="exitPrice"]', '95000'); // 5% loss
    
    await page.click('text=SYNC LEDGER');
    
    // Should succeed, not error
    await expect(page.locator('text=GENERATED')).toBeVisible({ timeout: 10000 });
  });
});
