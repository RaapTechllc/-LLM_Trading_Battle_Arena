import { TRADING_MODELS, getRarity } from '../../src/lib/constants';

describe('Constants', () => {
  test('TRADING_MODELS is defined and non-empty', () => {
    expect(TRADING_MODELS.length).toBeGreaterThan(0);
  });

  test('getRarity returns correct tiers', () => {
    expect(getRarity(15)).toBe('LEGENDARY');
    expect(getRarity(7)).toBe('EPIC');
    expect(getRarity(3)).toBe('RARE');
    expect(getRarity(1)).toBe('COMMON');
  });
});

describe('Sound Manager Error Handling', () => {
  test('handles audio context when available', () => {
    expect(window.AudioContext).toBeDefined();
  });

  test('soundManager module exists', async () => {
    const sounds = await import('../../src/lib/sounds');
    expect(sounds.soundManager).toBeDefined();
  });
});
