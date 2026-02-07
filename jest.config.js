/** @type {import('jest').Config} */
const config = {
  testEnvironment: 'jsdom',
  testMatch: ['**/tests/**/*.test.ts', '**/tests/**/*.test.tsx'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  transform: {
    '^.+\\.(ts|tsx)$': ['babel-jest', { 
      presets: [
        ['@babel/preset-env', { targets: { node: 'current' } }],
        '@babel/preset-typescript'
      ]
    }]
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
  ],
  testPathIgnorePatterns: ['/node_modules/', '/.next/'],
  transformIgnorePatterns: ['/node_modules/'],
};

module.exports = config;
