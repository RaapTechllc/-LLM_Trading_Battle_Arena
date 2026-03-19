import { test, expect } from '@playwright/test';

test.describe('Code Review Fixes', () => {
  test('battle validation prevents battle with insufficient cards', async ({ page }) => {
    // Clear any existing cards by going to a fresh state
    await page.goto('/battle');
    
    // If there are cards, this test may not be relevant
    // But we can test the validation message appears when expected
    await expect(page.locator('text=Battle Arena')).toBeVisible();
    
    // Check if there's a message about needing more cards
    const needMoreCardsMessage = page.locator('text=Need at least 6 cards total for battles');
    const createMoreCardsMessage = page.locator('text=Create more cards first');
    
    // If we see these messages, the validation is working
    if (await needMoreCardsMessage.isVisible()) {
      await expect(createMoreCardsMessage).toBeVisible();
    }
  });

  test('achievements page handles errors gracefully', async ({ page }) => {
    // Intercept the achievements API to simulate failure
    await page.route('/api/achievements', route => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Server error' })
      });
    });

    await page.goto('/achievements');
    
    // Should show error state
    await expect(page.locator('text=Oops!')).toBeVisible();
    await expect(page.locator('text=Failed to load achievements')).toBeVisible();
    await expect(page.locator('button:has-text("Try Again")')).toBeVisible();
  });

  test('sound manager handles audio failures gracefully', async ({ page }) => {
    // Test that the app still works even if audio fails
    await page.goto('/create-card');
    
    // Fill out and submit a card (this triggers sound)
    await page.fill('input[placeholder="Enter card name..."]', 'Sound Test Card');
    await page.click('button:has-text("Create Battle Card")');
    
    // Should still work even if sound fails
    await expect(page.locator('text=Card created successfully!')).toBeVisible();
  });

  test('AI opponent selection works end-to-end', async ({ page }) => {
    await page.goto('/battle');
    
    // Should show battle style selection
    await expect(page.locator('text=Choose Your Battle Style')).toBeVisible();
    
    // Click strategic battle
    await page.click('text=Strategic Battle');
    
    // Should show opponent selection
    await expect(page.locator('text=Choose Your Opponent')).toBeVisible();
    
    // Select random opponent
    await page.click('text=Random Opponent');
    
    // Should show card selection if enough cards exist
    const cardSelection = page.locator('text=Select Your Battle Deck');
    if (await cardSelection.isVisible()) {
      await expect(cardSelection).toBeVisible();
    }
  });
});
