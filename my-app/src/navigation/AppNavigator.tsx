import React, { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';

// Import your screens
import AuthScreen from '../screens/AuthScreen';
import ProfileScreen from '../screens/ProfileScreen';
import FindBuddyScreen from '../screens/FindBuddyScreen';
import ProfileSetupScreen from '../screens/ProfileSetupScreen';
import EditProfileScreen from '../screens/EditProfileScreen';
import MyBuddiesScreen from '../screens/MyBuddiesScreen';

// Types
// Add EditProfile to RootStackParamList for navigation typing
export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  ProfileSetup: undefined;
  EditProfile: undefined;
  AppTabs: undefined;
  [key: string]: undefined; // This allows any string key with undefined value
};

type MainTabsParamList = {
  'Find Buddy': undefined;
  'My Buddies': undefined;
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

export type ProfileStackParamList = {
  Profile: { userId?: string };
  EditProfile: undefined;
};
const ProfileStack = createNativeStackNavigator<ProfileStackParamList>();
function ProfileStackScreen() {
  return (
    <ProfileStack.Navigator>
      <ProfileStack.Screen 
        name="Profile" 
        component={ProfileScreen} 
        options={({ route }) => ({ 
          headerShown: false,
          title: route.params?.userId ? 'Buddy Profile' : 'My Profile'
        })} 
      />
      <ProfileStack.Screen 
        name="EditProfile" 
        component={EditProfileScreen} 
        options={{ title: 'Edit Profile' }} 
      />
    </ProfileStack.Navigator>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'help';

          if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          } else if (route.name === 'Find Buddy') {
            iconName = focused ? 'search' : 'search-outline';
          } else if (route.name === 'My Buddies') {
            iconName = focused ? 'people' : 'people-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      })}
    >
      <Tab.Screen name="Find Buddy" component={FindBuddyScreen} />
      <Tab.Screen name="My Buddies" component={MyBuddiesScreen} />
      <Tab.Screen 
        name="Profile" 
        component={ProfileStackScreen} 
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

  console.log('AppNavigator: Rendering navigation');

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {loading || (currentUser && userProfile === null) ? (
          <Stack.Screen name="Splash" component={SplashScreen} />
        ) : !currentUser ? (
          <Stack.Screen name="Auth" component={AuthScreen} />
        ) : currentUser && userProfile && !userProfile.name ? (
          <Stack.Screen
            name="ProfileSetup"
            component={ProfileSetupScreen}
            options={{ gestureEnabled: false }}
          />
        ) : (
          <Stack.Screen
            name="AppTabs"
            component={MainTabs}
            options={{ gestureEnabled: false }}
          />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}