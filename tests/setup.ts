import '@testing-library/jest-dom';

// Mock window.AudioContext for sound tests
const mockAudioContext = jest.fn(() => ({
  createOscillator: jest.fn(() => ({
    connect: jest.fn(),
    start: jest.fn(),
    stop: jest.fn(),
    frequency: { setValueAtTime: jest.fn() },
    type: 'sine'
  })),
  createGain: jest.fn(() => ({
    connect: jest.fn(),
    gain: { setValueAtTime: jest.fn(), linearRampToValueAtTime: jest.fn() }
  })),
  destination: {},
  currentTime: 0
}));

Object.defineProperty(window, 'AudioContext', {
  writable: true,
  value: mockAudioContext
});

Object.defineProperty(window, 'webkitAudioContext', {
  writable: true,
  value: mockAudioContext
});
