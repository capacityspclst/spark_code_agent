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
  },
  // Ensure experimental VM modules flag is passed to worker processes for dynamic import support
  nodeOptions: '--experimental-vm-modules',
};