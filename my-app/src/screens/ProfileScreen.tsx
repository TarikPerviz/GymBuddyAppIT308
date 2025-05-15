import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { getAvatarByIndex } from '../utils/avatarUtils';
import Avatar from '../components/Avatar';

const ProfileScreen: React.FC = () => {
  const { currentUser, userProfile, logout } = useAuth();
  const [loading, setLoading] = useState(true);
  
  // Stats data - these would come from your database in a real app
  const [stats, setStats] = useState([
    { label: 'Workouts', value: '0' },
    { label: 'Buddies', value: '0' },
    { label: 'Streak', value: '0 days' },
  ]);

  // In a real app, you would fetch this data from your database
  useEffect(() => {
    // Simulate loading user data
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);
  
  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Failed to log out', error);
    }
  };

  if (loading || !userProfile) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#4285f4" />
      </View>
    );
  }

  const { name, email, fitnessLevel, bio, workoutTypes, avatarIndex = 0 } = userProfile;
  const { avatarUri } = getAvatarByIndex(avatarIndex);

  return (
    <ScrollView style={styles.container}>
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
        <TouchableOpacity style={styles.settingItem}>
          <Text style={styles.settingText}>Edit Profile</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.settingItem}>
          <Text style={styles.settingText}>Notification Settings</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.settingItem, styles.logoutButton]}
          onPress={handleLogout}
        >
          <Text style={[styles.settingText, styles.logoutText]}>Logout</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
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
  logoutButton: {
    borderBottomWidth: 0,
    marginTop: 10,
  },
  logoutText: {
    color: '#d32f2f',
    textAlign: 'center',
  },
});

export default ProfileScreen;
