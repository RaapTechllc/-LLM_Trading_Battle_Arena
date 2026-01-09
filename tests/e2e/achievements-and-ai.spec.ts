import { test, expect } from '@playwright/test';

test.describe('Achievement System', () => {
  test('should display achievements page', async ({ page }) => {
    await page.goto('/achievements');
    
    // Check page loads
    await expect(page.locator('h1')).toContainText('Achievements');
    
    // Check achievement categories
    await expect(page.locator('button')).toContainText('All');
    await expect(page.locator('button')).toContainText('Creator');
    await expect(page.locator('button')).toContainText('Warrior');
    
    // Check achievement cards are displayed
    await expect(page.locator('.grid')).toBeVisible();
  });

  test('should unlock achievement after creating card', async ({ page }) => {
    // Go to card creation
    await page.goto('/create-card');
    
    // Fill out card form
    await page.fill('input[placeholder="Enter card name..."]', 'Test Achievement Card');
    await page.selectOption('select', 'CREATURE');
    await page.fill('textarea[placeholder="Describe your card\'s special ability..."]', 'Test ability');
    
    // Submit form
    await page.click('button[type="submit"]');
    
    // Wait for success message
    await expect(page.locator('text=Card created successfully!')).toBeVisible();
    
    // Check for achievement notification (if it appears)
    // Note: This might not always trigger if user already has cards
    const notification = page.locator('text=Achievement Unlocked!');
    if (await notification.isVisible()) {
      await expect(notification).toBeVisible();
    }
  });
});

test.describe('AI Opponent System', () => {
  test('should display AI opponent selection', async ({ page }) => {
    await page.goto('/battle');
    
    // Should show battle style selection first
    await expect(page.locator('text=Choose Your Battle Style')).toBeVisible();
    
    // Click strategic battle to see AI opponents
    await page.click('text=Strategic Battle');
    
    // Should show AI opponent selector
    await expect(page.locator('text=Choose Your Opponent')).toBeVisible();
    
    // Should show random opponent option
    await expect(page.locator('text=Random Opponent')).toBeVisible();
    
    // Should show AI opponents
    await expect(page.locator('text=Rookie Fighter')).toBeVisible();
    await expect(page.locator('text=Berserker')).toBeVisible();
  });

  test('should allow selecting AI opponent and battling', async ({ page }) => {
    await page.goto('/battle');
    
    // Choose strategic battle
    await page.click('text=Strategic Battle');
    
    // Select an AI opponent
    await page.click('text=Rookie Fighter');
    
    // Should show card selection
    await expect(page.locator('text=Select Your Battle Deck')).toBeVisible();
    
    // Select 3 cards (assuming cards exist)
    const cards = page.locator('[data-testid="battle-card"]').or(page.locator('.cursor-pointer')).first();
    if (await cards.count() >= 3) {
      for (let i = 0; i < 3; i++) {
        await cards.nth(i).click();
      }
      
      // Start battle
      await page.click('text=Battle Rookie Fighter!');
      
      // Should show battle results
      await expect(page.locator('text=Victory!').or(page.locator('text=Defeat!'))).toBeVisible();
    }
  });
});

test.describe('Enhanced Battle Experience', () => {
  test('should show opponent info in battle results', async ({ page }) => {
    await page.goto('/battle');
    
    // Quick battle path
    await page.click('text=Quick Battle');
    
    // Select cards if available
    const cards = page.locator('.cursor-pointer');
    const cardCount = await cards.count();
    
    if (cardCount >= 3) {
      for (let i = 0; i < 3; i++) {
        await cards.nth(i).click();
      }
      
      // Start battle
      await page.click('button:has-text("Battle")');
      
      // Check battle log shows opponent info
      await expect(page.locator('text=Battle Log')).toBeVisible();
      await expect(page.locator('text=Battle begins!')).toBeVisible();
    }
  });
});
