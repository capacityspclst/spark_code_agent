module.exports = {
  preset: 'jest-expo',
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest',
  },
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native|expo|@expo|@react-navigation|react-native-paper|@noble))',
  ],
  setupFilesAfterEnv: ['@testing-library/jest-native/extend-expect'],
};