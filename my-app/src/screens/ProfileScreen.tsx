import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { getAvatarByIndex } from '../utils/avatarUtils';
import Avatar from '../components/Avatar';
import { doc, getDoc } from 'firebase/firestore';
import { Ionicons } from '@expo/vector-icons';
import { db } from '../config/firebase';

import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { ProfileStackParamList } from '../navigation/AppNavigator';

type NestedParams = {
  params?: {
    userId?: string;
    params?: {
      userId?: string;
    };
  };
  userId?: string;
};

type ProfileScreenRouteProp = RouteProp<ProfileStackParamList, 'Profile'> & {
  params?: NestedParams;
};

const ProfileScreen: React.FC = () => {
  const route = useRoute<ProfileScreenRouteProp>();
  const navigation = useNavigation<NativeStackNavigationProp<ProfileStackParamList>>();
  const { currentUser, userProfile, logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState<any>(null);
  const [isCurrentUser, setIsCurrentUser] = useState(true);
  
  // Stats data - these would come from your database in a real app
  const [stats, setStats] = useState([
    { label: 'Workouts', value: '0' },
    { label: 'Buddies', value: '0' },
    { label: 'Streak', value: '0 days' },
  ]);

  // Get the userId from route params, handling both direct and nested navigation
  const getUserIdFromParams = () => {
    // Check for direct params (from direct navigation)
    if (route.params?.userId) {
      return route.params.userId;
    }
    // Check for nested params (from tab navigation)
    if (route.params?.params?.userId) {
      return route.params.params.userId;
    }
    return null;
  };

  // Load profile data
  useEffect(() => {
    console.log('ProfileScreen mounted with params:', route.params);
    const loadProfile = async () => {
      try {
        setLoading(true);
        const userId = getUserIdFromParams();
        
        // If viewing another user's profile
        if (userId && userId !== currentUser?.uid) {
          console.log('Loading buddy profile with ID:', userId);
          const userDoc = await getDoc(doc(db, 'users', userId));
          if (userDoc.exists()) {
            console.log('Buddy profile data:', userDoc.data());
            setProfileData(userDoc.data());
            setIsCurrentUser(false);
          } else {
            console.log('Buddy profile not found');
          }
        } else {
          // Current user's profile
          console.log('Loading current user profile');
          setProfileData(userProfile);
          setIsCurrentUser(true);
        }
      } catch (error) {
        console.error('Error loading profile:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [route.params?.userId, currentUser, userProfile]);
  
  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Failed to log out', error);
    }
  };

  if (loading || !profileData) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#4285f4" />
      </View>
    );
  }

  const { name, email, fitnessLevel, bio, workoutTypes, avatarIndex = 0 } = profileData;
  const { avatarUri } = getAvatarByIndex(avatarIndex);

  // Function to navigate back to the current user's profile
  const handleBackToMyProfile = () => {
    // Navigate to the profile tab without any parameters
    // This will show the current user's profile
    navigation.navigate('Profile', {});
  };

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.scrollContainer}
    >
      {!isCurrentUser && (
        <TouchableOpacity 
          style={styles.backButton}
          onPress={handleBackToMyProfile}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
          <Text style={styles.backButtonText}>My Profile</Text>
        </TouchableOpacity>
      )}
      <View style={styles.header}>
        <Avatar size={100} avatarIndex={avatarIndex} />
        <Text style={styles.name}>{name || 'New User'}</Text>
        <Text style={styles.level}>{fitnessLevel || 'Beginner'} Level</Text>
      </View>

      <View style={styles.statsContainer}>
        {stats.map((stat, index) => (
          <View key={index} style={styles.statItem}>
            <Text style={styles.statValue}>{stat.value}</Text>
            <Text style={styles.statLabel}>{stat.label}</Text>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About Me</Text>
        {bio ? (
          <Text style={styles.bio}>{bio}</Text>
        ) : (
          <Text style={[styles.bio, styles.placeholderText]}>No bio added yet</Text>
        )}
        <Text style={styles.detail}>
          <Text style={styles.detailLabel}>Workout Types: </Text>
          {workoutTypes?.length ? workoutTypes.join(', ') : 'Not specified'}
        </Text>
        <Text style={styles.detail}>
          <Text style={styles.detailLabel}>Email: </Text>
          {email || 'No email'}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Settings</Text>
        {isCurrentUser && (
          <TouchableOpacity 
            style={styles.editButton}
            onPress={() => navigation.navigate('EditProfile')}
          >
            <Text style={styles.editButtonText}>Edit Profile</Text>
          </TouchableOpacity>
        )}
        {isCurrentUser && (
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutButtonText}>Log Out</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContainer: {
    paddingBottom: 20,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4285f4',
    padding: 10,
    margin: 10,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  backButtonText: {
    color: '#fff',
    marginLeft: 5,
    fontWeight: '600',
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: '#999',
    fontStyle: 'italic',
  },
  header: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
    marginBottom: 10,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  level: {
    color: '#4285f4',
    fontWeight: '500',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    margin: 10,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },
  section: {
    backgroundColor: 'white',
    margin: 10,
    padding: 15,
    borderRadius: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  bio: {
    fontSize: 14,
    lineHeight: 20,
    color: '#333',
    marginBottom: 15,
  },
  detail: {
    fontSize: 14,
    marginBottom: 8,
    color: '#333',
  },
  detailLabel: {
    fontWeight: '600',
    color: '#666',
  },
  settingItem: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  settingText: {
    fontSize: 16,
    color: '#333',
  },
  editButton: {
    backgroundColor: '#4285f4',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 15,
  },
  editButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  logoutButton: {
    backgroundColor: '#f8d7da',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  logoutButtonText: {
    color: '#d32f2f',
    fontWeight: '600',
    fontSize: 16,
  },
});

export default ProfileScreen;
