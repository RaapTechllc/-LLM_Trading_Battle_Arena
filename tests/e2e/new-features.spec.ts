import { test, expect } from '@playwright/test'

test.describe('New Features', () => {
  test('Card favorites functionality', async ({ page }) => {
    await page.goto('/')
    
    // Navigate to collection
    await page.click('text=Collection')
    await expect(page).toHaveURL('/collection')
    
    // Check if favorites filter button exists
    await expect(page.locator('button:has-text("All")')).toBeVisible()
    
    // If there are cards, test favorite functionality
    const cardCount = await page.locator('[data-testid="card"]').count()
    if (cardCount > 0) {
      // Click first favorite button
      await page.locator('button[title*="favorite"]').first().click()
      
      // Check if favorites filter works
      await page.click('button:has-text("All")')
      await expect(page.locator('button:has-text("Favorites")')).toBeVisible()
    }
  })

  test('Battle history page loads', async ({ page }) => {
    await page.goto('/')
    
    // Navigate to battle history
    await page.click('text=History')
    await expect(page).toHaveURL('/battle-history')
    
    // Check page elements
    await expect(page.locator('h1:has-text("Battle History")')).toBeVisible()
    await expect(page.locator('text=Educational Simulation')).toBeVisible()
    
    // Check for either battles or empty state
    const hasBattles = await page.locator('text=Total Battles').isVisible()
    const hasEmptyState = await page.locator('text=No Battles Yet').isVisible()
    expect(hasBattles || hasEmptyState).toBeTruthy()
  })

  test('Navigation includes new features', async ({ page }) => {
    await page.goto('/')
    
    // Check navigation includes History link
    await expect(page.locator('nav a:has-text("History")')).toBeVisible()
    
    // Check keyboard shortcuts tooltip updated
    await expect(page.locator('[title*="Alt+5"]')).toBeVisible()
  })

  test('Home page showcases new features', async ({ page }) => {
    await page.goto('/')
    
    // Check new features section
    await expect(page.locator('text=Card Favorites')).toBeVisible()
    await expect(page.locator('text=Battle History')).toBeVisible()
    
    // Check feature links work
    await page.click('text=Manage Favorites')
    await expect(page).toHaveURL('/collection')
    
    await page.goto('/')
    await page.click('text=View History')
    await expect(page).toHaveURL('/battle-history')
  })

  test('Keyboard shortcuts work for new features', async ({ page }) => {
    await page.goto('/')
    
    // Test Alt+5 for battle history
    await page.keyboard.press('Alt+5')
    await expect(page).toHaveURL('/battle-history')
  })
})
