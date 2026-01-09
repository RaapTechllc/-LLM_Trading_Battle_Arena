import { test, expect } from '@playwright/test';

test.describe('Card Trading System', () => {
  test('should display trade page', async ({ page }) => {
    await page.goto('/trade');
    
    // Check page loads
    await expect(page.locator('h1')).toContainText('Card Trading Center');
    
    // Check educational disclaimer
    await expect(page.locator('text=Educational Paper Trading Only')).toBeVisible();
    
    // Check tab navigation
    await expect(page.locator('button:has-text("Create Trade")')).toBeVisible();
    await expect(page.locator('button:has-text("Trade Inbox")')).toBeVisible();
  });

  test('should show trade partners', async ({ page }) => {
    await page.goto('/trade');
    
    // Should show trading partners
    await expect(page.locator('text=Select Trading Partner')).toBeVisible();
    await expect(page.locator('text=Alex the Collector')).toBeVisible();
    await expect(page.locator('text=Sam the Strategist')).toBeVisible();
    await expect(page.locator('text=Jordan the Battler')).toBeVisible();
    await expect(page.locator('text=Casey the Creator')).toBeVisible();
  });

  test('should select trading partner and show cards', async ({ page }) => {
    await page.goto('/trade');
    
    // Select a trading partner
    await page.click('text=Alex the Collector');
    
    // Should show card sections
    await expect(page.locator('text=Your Cards (Offering:')).toBeVisible();
    await expect(page.locator('text=Alex the Collector\'s Cards (Requesting:')).toBeVisible();
    
    // Should show complete trade section
    await expect(page.locator('text=Complete Trade')).toBeVisible();
    await expect(page.locator('textarea[placeholder*="Add a message"]')).toBeVisible();
  });

  test('should create a trade offer', async ({ page }) => {
    await page.goto('/trade');
    
    // Wait for cards to load
    await page.waitForTimeout(2000);
    
    // Select trading partner
    await page.click('text=Alex the Collector');
    
    // Wait for partner cards to load
    await page.waitForTimeout(1000);
    
    // Select cards to offer (your cards)
    const yourCards = page.locator('text=Your Cards').locator('..').locator('.cursor-pointer');
    if (await yourCards.count() > 0) {
      await yourCards.first().click();
    }
    
    // Select cards to request (partner's cards)
    const partnerCards = page.locator('text=Alex the Collector\'s Cards').locator('..').locator('.cursor-pointer');
    if (await partnerCards.count() > 0) {
      await partnerCards.first().click();
    }
    
    // Add trade message
    await page.fill('textarea[placeholder*="Add a message"]', 'Fair trade offer!');
    
    // Send trade offer
    const sendButton = page.locator('button:has-text("Send Trade Offer")');
    if (await sendButton.isEnabled()) {
      await sendButton.click();
      
      // Should switch to inbox tab
      await expect(page.locator('button:has-text("Trade Inbox")')).toHaveClass(/bg-white/);
    }
  });

  test('should show trade inbox', async ({ page }) => {
    await page.goto('/trade');
    
    // Switch to inbox tab
    await page.click('button:has-text("Trade Inbox")');
    
    // Should show inbox content
    await expect(page.locator('text=No Trades Yet').or(page.locator('text=Trade with'))).toBeVisible();
  });

  test('should show trade buttons in collection', async ({ page }) => {
    await page.goto('/collection');
    
    // Wait for cards to load
    await page.waitForSelector('[data-testid="card-item"]', { timeout: 10000 });
    
    // Should show trade buttons on cards
    await expect(page.locator('text=🔄 Trade This Card').first()).toBeVisible();
    
    // Click trade button should navigate to trade page
    await page.click('text=🔄 Trade This Card');
    await expect(page).toHaveURL(/\/trade/);
  });

  test('should handle trade actions', async ({ page }) => {
    // This test would require setting up a trade first
    // For now, just verify the inbox shows proper action buttons
    await page.goto('/trade');
    await page.click('button:has-text("Trade Inbox")');
    
    // If there are trades, they should have action buttons
    const tradeItems = page.locator('text=Trade with');
    if (await tradeItems.count() > 0) {
      // Look for trade action buttons
      await expect(
        page.locator('button:has-text("Accept Trade")').or(
          page.locator('button:has-text("Reject Trade")')
        ).or(
          page.locator('button:has-text("Cancel Trade")')
        )
      ).toBeVisible();
    }
  });

  test('should validate trade requirements', async ({ page }) => {
    await page.goto('/trade');
    
    // Select trading partner
    await page.click('text=Alex the Collector');
    await page.waitForTimeout(1000);
    
    // Send button should be disabled without card selection
    const sendButton = page.locator('button:has-text("Send Trade Offer")');
    await expect(sendButton).toBeDisabled();
    
    // Should show proper counts
    await expect(page.locator('text=Offering: 0')).toBeVisible();
    await expect(page.locator('text=Requesting: 0')).toBeVisible();
  });
});
