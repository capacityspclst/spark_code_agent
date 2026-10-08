module.exports = {
  preset: 'jest-expo',
  testEnvironment: 'jsdom',
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native|expo|@expo|@react-navigation|react-native-paper|@noble|@expo/vector-icons|react-native-vector-icons))',
  ],
  moduleNameMapper: {
    '^@noble/hashes/utils$': '<rootDir>/__mocks__/nobleHashesUtils.ts',
    '^@react-native-async-storage/async-storage$': '<rootDir>/__mocks__/@react-native-async-storage/async-storage.js',
    '^expo-file-system$': '<rootDir>/__mocks__/expo-file-system.js',
    '^expo-sqlite$': '<rootDir>/__mocks__/expo-sqlite.js',
  },
  setupFiles: ['<rootDir>/setupEnv.js'],
  setupFilesAfterEnv: ['@testing-library/jest-native/extend-expect'],
};