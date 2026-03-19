import { test, expect } from '@playwright/test'

test.describe('ASCII Art Enhancements', () => {
  test('should display ASCII art in card collection', async ({ page }) => {
    // Navigate to collection page
    await page.goto('/collection')
    
    // Wait for cards to load
    await page.waitForSelector('[data-testid="card-item"]', { timeout: 10000 })
    
    // Check that ASCII art is displayed instead of emoji
    const cardArt = page.locator('pre').first()
    await expect(cardArt).toBeVisible()
    
    // Verify ASCII art contains expected characters
    const artContent = await cardArt.textContent()
    expect(artContent).toMatch(/[░▓█♦▄▀]/) // Should contain ASCII art characters
  })

  test('should show different ASCII art for different rarities', async ({ page }) => {
    // Navigate to card creator to see live preview
    await page.goto('/create-card')
    
    // Wait for form to load
    await page.waitForSelector('select[name="rarity"]', { timeout: 5000 })
    
    // Select different rarities and check ASCII art changes
    const raritySelect = page.locator('select').filter({ hasText: 'Common' })
    
    // Test Common rarity
    await raritySelect.selectOption('COMMON')
    let artContent = await page.locator('pre').textContent()
    expect(artContent).toContain('░') // Common uses light shade
    
    // Test Legendary rarity
    await raritySelect.selectOption('LEGENDARY')
    artContent = await page.locator('pre').textContent()
    expect(artContent).toContain('♦') // Legendary uses diamonds
  })

  test('should display ASCII art in card creator preview', async ({ page }) => {
    // Navigate to card creator
    await page.goto('/create-card')
    
    // Wait for preview to load
    await page.waitForSelector('pre', { timeout: 5000 })
    
    // Verify ASCII art is shown in preview
    const previewArt = page.locator('pre')
    await expect(previewArt).toBeVisible()
    
    // Change card type and verify art updates
    const cardTypeSelect = page.locator('select').filter({ hasText: 'Creature' })
    await cardTypeSelect.selectOption('SPELL')
    
    // Art should still be visible after type change
    await expect(previewArt).toBeVisible()
  })

  test('should maintain holographic effects with ASCII art', async ({ page }) => {
    // Navigate to collection
    await page.goto('/collection')
    
    // Wait for holographic cards to load
    await page.waitForSelector('.holographic-card', { timeout: 10000 })
    
    // Verify both holographic effects and ASCII art coexist
    const holographicCard = page.locator('.holographic-card').first()
    const asciiArt = holographicCard.locator('pre')
    
    await expect(holographicCard).toBeVisible()
    await expect(asciiArt).toBeVisible()
    
    // Hover to trigger holographic effects
    await holographicCard.hover()
    
    // ASCII art should still be visible during hover
    await expect(asciiArt).toBeVisible()
  })
})
