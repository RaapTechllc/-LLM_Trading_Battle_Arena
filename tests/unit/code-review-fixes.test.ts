import { DEFAULT_USER_ID } from '../../src/lib/constants';

describe('Constants', () => {
  test('DEFAULT_USER_ID is defined', () => {
    expect(DEFAULT_USER_ID).toBe('demo-user');
  });
});

describe('Sound Manager Error Handling', () => {
  test('handles audio context when available', () => {
    // With our test setup, AudioContext is mocked
    expect(window.AudioContext).toBeDefined();
  });
  
  test('soundManager module exists', async () => {
    // Dynamic import to test module loads
    const sounds = await import('../../src/lib/sounds');
    expect(sounds.soundManager).toBeDefined();
  });
});
