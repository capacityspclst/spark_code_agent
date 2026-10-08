// jest-expo runs tests with React Native's module resolution. Packages shipped as untranspiled or ESM-only
// (React Native, Expo, React Navigation, Paper, @noble/*) must be transformed, so they are excluded from the
// default node_modules ignore pattern.
module.exports = {
  preset: 'jest-expo',
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?|expo(nent)?|@expo(nent)?/.*|expo-.*|@react-navigation/.*|react-native-paper|react-native-vector-icons|@noble/.*))',
  ],
  testPathIgnorePatterns: ['/node_modules/'],
};
