import { test, expect } from '@playwright/test';

test.describe('Deck Building System', () => {
  test('should display deck builder page', async ({ page }) => {
    await page.goto('/deck-builder');
    
    // Check page loads
    await expect(page.locator('h1')).toContainText('Deck Builder');
    
    // Check educational disclaimer
    await expect(page.locator('text=Educational Simulation Only')).toBeVisible();
    
    // Check deck creation form
    await expect(page.locator('input[placeholder="Deck name..."]')).toBeVisible();
    await expect(page.locator('button:has-text("Save")')).toBeVisible();
    
    // Check mana curve display
    await expect(page.locator('text=Mana Curve')).toBeVisible();
  });

  test('should create a new deck', async ({ page }) => {
    await page.goto('/deck-builder');
    
    // Wait for cards to load
    await page.waitForSelector('.cursor-pointer', { timeout: 10000 });
    
    // Enter deck name
    await page.fill('input[placeholder="Deck name..."]', 'Test Deck');
    
    // Select 10 cards (minimum for deck)
    const cards = page.locator('.cursor-pointer');
    const cardCount = await cards.count();
    
    for (let i = 0; i < Math.min(10, cardCount); i++) {
      await cards.nth(i).click();
    }
    
    // Check that cards are selected
    await expect(page.locator('text=Cards: 10/30')).toBeVisible();
    
    // Save deck
    await page.click('button:has-text("Save")');
    
    // Should show success (deck appears in list)
    await expect(page.locator('text=Test Deck')).toBeVisible();
  });

  test('should set deck as active', async ({ page }) => {
    await page.goto('/deck-builder');
    
    // Wait for any existing decks to load
    await page.waitForTimeout(2000);
    
    // Look for existing deck or create one
    const existingDeck = page.locator('button:has-text("Set Active")').first();
    
    if (await existingDeck.count() > 0) {
      await existingDeck.click();
      
      // Should show as active
      await expect(page.locator('text=ACTIVE')).toBeVisible();
    }
  });

  test('should use active deck in battle', async ({ page }) => {
    // First create and activate a deck
    await page.goto('/deck-builder');
    await page.waitForSelector('.cursor-pointer', { timeout: 10000 });
    
    await page.fill('input[placeholder="Deck name..."]', 'Battle Deck');
    
    // Select cards
    const cards = page.locator('.cursor-pointer');
    const cardCount = await cards.count();
    
    for (let i = 0; i < Math.min(10, cardCount); i++) {
      await cards.nth(i).click();
    }
    
    await page.click('button:has-text("Save")');
    await page.waitForTimeout(1000);
    
    // Set as active
    await page.click('button:has-text("Set Active")');
    
    // Go to battle page
    await page.goto('/battle');
    
    // Should show active deck information
    await expect(page.locator('text=Using Deck: Battle Deck')).toBeVisible();
    await expect(page.locator('text=Using Active Deck')).toBeVisible();
  });

  test('should show deck stats', async ({ page }) => {
    await page.goto('/deck-builder');
    await page.waitForSelector('.cursor-pointer', { timeout: 10000 });
    
    // Select some cards
    const cards = page.locator('.cursor-pointer');
    await cards.first().click();
    await cards.nth(1).click();
    
    // Should show mana curve updates
    await expect(page.locator('text=Avg Mana:')).toBeVisible();
    
    // Mana curve should show some bars
    const manaCurve = page.locator('text=Mana Curve').locator('..').locator('.bg-blue-500');
    await expect(manaCurve.first()).toBeVisible();
  });

  test('should validate deck size', async ({ page }) => {
    await page.goto('/deck-builder');
    
    // Try to save with no cards
    await page.fill('input[placeholder="Deck name..."]', 'Empty Deck');
    
    // Save button should be disabled
    await expect(page.locator('button:has-text("Save")')).toBeDisabled();
    
    // Add cards to meet minimum
    await page.waitForSelector('.cursor-pointer', { timeout: 10000 });
    const cards = page.locator('.cursor-pointer');
    
    // Add 9 cards (below minimum)
    for (let i = 0; i < 9; i++) {
      await cards.nth(i).click();
    }
    
    // Should still be disabled
    await expect(page.locator('button:has-text("Save")')).toBeDisabled();
    
    // Add 10th card
    await cards.nth(9).click();
    
    // Should now be enabled
    await expect(page.locator('button:has-text("Save")')).toBeEnabled();
  });
});
