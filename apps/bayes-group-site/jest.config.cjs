/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testMatch: ['**/__tests__/**/*.test.ts'],
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    '\\.css$': '<rootDir>/test/styleMock.cjs',
  },
  extensionsToTreatAsEsm: ['.js', '.ts', '.tsx'],
  globals: {
    'ts-jest': {
      useESM: true,
    },
  },
};
