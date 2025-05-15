export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  ProfileSetup: undefined;
  // Add other screen params here as needed
};

// This allows type checking for navigation props
declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
