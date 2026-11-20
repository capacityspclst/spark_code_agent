/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testMatch: ['**/__tests__/**/*.test.ts'],
  testEnvironment: 'jsdom',
  globals: {
    'ts-jest': {
      useESM: false,
    },
  },
  moduleNameMapper: {
    '\\.css$': '<rootDir>/test/styleMock.cjs',
  },
};
