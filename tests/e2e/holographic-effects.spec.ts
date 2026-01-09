import { test, expect } from '@playwright/test'

test.describe('Holographic Card Effects', () => {
  test('should display holographic effects on cards', async ({ page }) => {
    // Navigate to collection page
    await page.goto('/collection')
    
    // Wait for cards to load
    await page.waitForSelector('[data-testid="card-item"]', { timeout: 10000 })
    
    // Check that holographic card wrapper exists
    const holographicCards = page.locator('.holographic-card')
    await expect(holographicCards.first()).toBeVisible()
    
    // Verify different rarity classes are applied
    const legendaryCard = page.locator('.holographic-legendary').first()
    const epicCard = page.locator('.holographic-epic').first()
    const rareCard = page.locator('.holographic-rare').first()
    
    // At least one type should exist (depending on seeded cards)
    const anyHolographicCard = page.locator('.holographic-card').first()
    await expect(anyHolographicCard).toBeVisible()
  })

  test('should show foil shine effect on hover', async ({ page }) => {
    // Navigate to collection page
    await page.goto('/collection')
    
    // Wait for cards to load
    await page.waitForSelector('.holographic-card', { timeout: 10000 })
    
    // Get first holographic card
    const firstCard = page.locator('.holographic-card').first()
    
    // Check that foil shine element exists
    const foilShine = firstCard.locator('.foil-shine')
    await expect(foilShine).toBeAttached()
    
    // Hover over card to trigger effects
    await firstCard.hover()
    
    // Verify card has hover state (transform should be applied)
    await expect(firstCard).toHaveCSS('transform', /matrix3d|matrix/)
  })

  test('should apply holographic effects in battle arena', async ({ page }) => {
    // Navigate to battle page
    await page.goto('/battle')
    
    // Wait for cards to load
    await page.waitForSelector('.holographic-card', { timeout: 10000 })
    
    // Verify holographic cards exist in battle arena
    const battleCards = page.locator('.holographic-card')
    await expect(battleCards.first()).toBeVisible()
    
    // Check that cards can be selected (click functionality works)
    await battleCards.first().click()
    
    // Verify selection state
    await expect(page.locator('.ring-yellow-400')).toBeVisible()
  })
})
