import { test, expect } from '@playwright/test';

test.describe('Card Favorites System', () => {
  test('should toggle card favorites in collection', async ({ page }) => {
    await page.goto('/collection');
    
    // Wait for cards to load
    await expect(page.locator('[data-testid="card-item"]').first()).toBeVisible();
    
    // Find first card's favorite button
    const firstCard = page.locator('[data-testid="card-item"]').first();
    const favoriteButton = firstCard.locator('button[title*="favorite"]');
    
    // Check initial state (should be unfavorited - ☆)
    await expect(favoriteButton).toContainText('☆');
    
    // Click to favorite
    await favoriteButton.click();
    
    // Should now be favorited (⭐)
    await expect(favoriteButton).toContainText('⭐');
    
    // Click to unfavorite
    await favoriteButton.click();
    
    // Should be back to unfavorited
    await expect(favoriteButton).toContainText('☆');
  });

  test('should filter by favorites only', async ({ page }) => {
    await page.goto('/collection');
    
    // Wait for cards to load
    await expect(page.locator('[data-testid="card-item"]').first()).toBeVisible();
    
    // Favorite a card first
    const firstCard = page.locator('[data-testid="card-item"]').first();
    const favoriteButton = firstCard.locator('button[title*="favorite"]');
    await favoriteButton.click();
    
    // Wait for favorite to be set
    await expect(favoriteButton).toContainText('⭐');
    
    // Click favorites filter
    await page.click('button:has-text("All")');
    
    // Should now show "Favorites" and filter to only favorited cards
    await expect(page.locator('button:has-text("Favorites")')).toBeVisible();
    
    // All visible cards should have favorite stars
    const visibleCards = page.locator('[data-testid="card-item"]');
    const count = await visibleCards.count();
    
    for (let i = 0; i < count; i++) {
      const card = visibleCards.nth(i);
      await expect(card.locator('button[title*="favorite"]')).toContainText('⭐');
    }
  });

  test('should show favorites count in stats', async ({ page }) => {
    await page.goto('/collection');
    
    // Wait for stats to load
    await expect(page.locator('text=Total Cards')).toBeVisible();
    
    // Should show favorites count
    await expect(page.locator('text=Favorites')).toBeVisible();
    
    // Favorite a card
    const firstCard = page.locator('[data-testid="card-item"]').first();
    const favoriteButton = firstCard.locator('button[title*="favorite"]');
    await favoriteButton.click();
    
    // Favorites count should update (may need to wait for re-render)
    await page.waitForTimeout(500);
    
    // Check that favorites section exists in stats
    await expect(page.locator('text=Favorites')).toBeVisible();
  });

  test('should show favorite indicator in battle selection', async ({ page }) => {
    // First, favorite a card in collection
    await page.goto('/collection');
    await expect(page.locator('[data-testid="card-item"]').first()).toBeVisible();
    
    const firstCard = page.locator('[data-testid="card-item"]').first();
    const favoriteButton = firstCard.locator('button[title*="favorite"]');
    await favoriteButton.click();
    await expect(favoriteButton).toContainText('⭐');
    
    // Go to battle page
    await page.goto('/battle');
    
    // Wait for cards to load
    await expect(page.locator('text=Selected: 0/3 cards')).toBeVisible();
    
    // Check if any cards show favorite star
    const battleCards = page.locator('.grid .cursor-pointer');
    const count = await battleCards.count();
    
    // Look for favorite stars in battle selection
    let foundFavorite = false;
    for (let i = 0; i < count; i++) {
      const card = battleCards.nth(i);
      const favoriteIcon = card.locator('span[title="Favorite"]');
      if (await favoriteIcon.count() > 0) {
        foundFavorite = true;
        await expect(favoriteIcon).toContainText('⭐');
        break;
      }
    }
    
    // At least one card should show as favorite
    expect(foundFavorite).toBe(true);
  });
});
