// navigation/RootNavigator.tsx
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AuthScreen from '../screens/AuthScreen';
import HomeScreen from '../screens/HomeScreen';
import ProfileSetupScreen from '../screens/ProfileSetupScreen';

export type RootStackParamList = {
  Auth: undefined;
  Home: undefined;
  ProfileSetup: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Auth">
        <Stack.Screen name="Auth" component={AuthScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="ProfileSetup" component={ProfileSetupScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
