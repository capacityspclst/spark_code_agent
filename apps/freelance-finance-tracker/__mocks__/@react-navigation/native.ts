// Minimal mock for @react-navigation/native to satisfy tests without native code.
export const useNavigation = () => ({
  navigate: jest.fn(),
  goBack: jest.fn(),
  addListener: () => jest.fn(),
});
export const useRoute = () => ({});
export const NavigationProp = {} as any;
export const RouteProp = {} as any;
