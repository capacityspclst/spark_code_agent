// jest-expo runs tests with React Native's module resolution.
export default {
  preset: 'jest-expo',
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]sx?$': 'babel-jest',
  },
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?|expo(nent)?|@expo(nent)?/.*|expo-.*|@react-navigation/.*|react-native-paper|react-native-vector-icons|@noble/.*))',
  ],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '^expo-sqlite$': '<rootDir>/__mocks__/expo-sqlite.ts',
    '^@noble/ciphers/aes\\.js$': '<rootDir>/__mocks__/noble-ciphers-aes.cjs',
    '^@noble/hashes/scrypt\\.js$': '<rootDir>/__mocks__/noble-hashes-scrypt.cjs',
  },
  // Ignore duplicate manual mock files that are not used.
  modulePathIgnorePatterns: [
    '<rootDir>/__mocks__/noble-ciphers-aes.js',
    '<rootDir>/__mocks__/noble-ciphers-aes.mjs',
    '<rootDir>/__mocks__/noble-ciphers-aes.esm.js',
    '<rootDir>/__mocks__/noble-hashes-scrypt.js',
    '<rootDir>/__mocks__/noble-hashes-scrypt.mjs',
    '<rootDir>/__mocks__/@noble/',
  ],
  // Ignore the mistakenly prefixed test folder with a leading space.
  testPathIgnorePatterns: ['<rootDir>/ __tests__/'],
  // Note: test script in package.json already adds --experimental-vm-modules
};