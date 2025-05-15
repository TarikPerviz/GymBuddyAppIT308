import React, { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';

// Import your screens
import AuthScreen from '../screens/AuthScreen';
import HomeScreen from '../screens/HomeScreen';
import ProfileScreen from '../screens/ProfileScreen';
import FindBuddyScreen from '../screens/FindBuddyScreen';
import WorkoutScreen from '../screens/WorkoutScreen';
import ProfileSetupScreen from '../screens/ProfileSetupScreen';

// Types
export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  ProfileSetup: undefined;
  AppTabs: undefined;
  [key: string]: undefined; // This allows any string key with undefined value
};

type MainTabsParamList = {
  Home: undefined;
  'Find Buddy': undefined;
  Workout: undefined;
  Profile: undefined;
};

// Simple loading component
const SplashScreen = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    <ActivityIndicator size="large" />
  </View>
);

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabsParamList>();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'help';

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          } else if (route.name === 'Find Buddy') {
            iconName = focused ? 'people' : 'people-outline';
          } else if (route.name === 'Workout') {
            iconName = focused ? 'barbell' : 'barbell-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Find Buddy" component={FindBuddyScreen} />
      <Tab.Screen name="Workout" component={WorkoutScreen} />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen} 
        options={{
          tabBarLabel: 'Profile',
        }}
      />
    </Tab.Navigator>
  );
}

// Main App Navigator
export default function AppNavigator() {
  const { currentUser, userProfile, loading } = useAuth();

  // Show loading screen while checking auth state
  if (loading) {
    return <SplashScreen />;
  }

  console.log('AppNavigator: Rendering navigation');

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!currentUser ? (
          // No user logged in - show auth screen
          (() => {
            console.log('AppNavigator: Rendering Auth screen');
            return <Stack.Screen name="Auth" component={AuthScreen} />;
          })()
        ) : !userProfile?.name ? (
          // User logged in but profile not complete - show profile setup
          (() => {
            console.log('AppNavigator: Rendering ProfileSetup screen', { 
              hasName: !!userProfile?.name,
              userId: currentUser.uid 
            });
            return (
              <Stack.Screen 
                name="ProfileSetup" 
                component={ProfileSetupScreen} 
                options={{
                  gestureEnabled: false, // Prevent going back
                }}
              />
            );
          })()
        ) : (
          // User logged in and profile complete - show main app
          (() => {
            console.log('AppNavigator: Rendering MainTabs', { 
              userName: userProfile?.name,
              userId: currentUser.uid 
            });
            return (
              <Stack.Screen 
                name="AppTabs" 
                component={MainTabs}
                options={{
                  gestureEnabled: false, // Prevent going back to auth
                }}
              />
            );
          })()
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}