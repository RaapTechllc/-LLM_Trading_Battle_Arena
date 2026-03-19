import { describe, test, expect } from 'vitest'

describe('Constants', () => {
  test('TRADING_MODELS is defined and non-empty', async () => {
    const { TRADING_MODELS } = await import('@/lib/constants')
    expect(TRADING_MODELS.length).toBeGreaterThan(0)
  })

  test('getRarity returns correct tiers', async () => {
    const { getRarity } = await import('@/lib/constants')
    expect(getRarity(15)).toBe('LEGENDARY')
    expect(getRarity(7)).toBe('EPIC')
    expect(getRarity(3)).toBe('RARE')
    expect(getRarity(1)).toBe('COMMON')
  })
})

describe('Sound Manager', () => {
  test('soundManager module exports soundManager', async () => {
    const sounds = await import('@/lib/sounds')
    expect(sounds.soundManager).toBeDefined()
  })
})
