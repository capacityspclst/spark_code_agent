module.exports = {
  preset: 'jest-expo',
  testEnvironment: 'jsdom',
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native|expo|@expo|@react-navigation|react-native-paper|@noble|@expo/vector-icons|react-native-vector-icons))',
  ],
  moduleNameMapper: {
    '^@noble/hashes/utils$': '<rootDir>/__mocks__/nobleHashesUtils.ts',
  },
  setupFilesAfterEnv: ['@testing-library/jest-native/extend-expect'],
};