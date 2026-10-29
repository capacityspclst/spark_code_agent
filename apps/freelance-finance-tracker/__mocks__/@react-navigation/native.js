module.exports = {
  useNavigation: () => ({ navigate: jest.fn(), goBack: jest.fn(), addListener: () => jest.fn() }),
  useRoute: () => ({}),
  NavigationProp: {},
  RouteProp: {}
};