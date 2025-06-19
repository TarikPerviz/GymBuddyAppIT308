import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Image, ActivityIndicator, TouchableOpacity, ScrollView, RefreshControl } from 'react-native';
import { collection, getDocs, doc, getDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db, auth } from '../config/firebase';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ProfileStackParamList } from '../navigation/AppNavigator';

interface User {
  id: string;
  name: string;
  photoURL?: string;
  fitnessLevel?: string;
  workoutTypes?: string[];
}

const MyBuddiesScreen = () => {
  const [buddies, setBuddies] = useState<User[]>([]);
  const [pendingRequests, setPendingRequests] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  type ProfileScreenParams = {
    Profile: { userId: string };
  };
  
  const navigation = useNavigation<any>(); // Using any to avoid type issues with nested navigators

  const loadData = async () => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        setError('User not authenticated');
        setLoading(false);
        return;
      }

      // Get current user's document
      const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
      const userData = userDoc.data();
      
      // Load buddies
      if (userData?.buddies?.length) {
        const buddiesPromises = userData.buddies.map(async (buddyId: string) => {
          const buddyDoc = await getDoc(doc(db, 'users', buddyId));
          return { id: buddyDoc.id, ...buddyDoc.data() } as User;
        });
        const buddiesList = await Promise.all(buddiesPromises);
        setBuddies(buddiesList);
      } else {
        setBuddies([]);
      }

      // Load pending requests
      if (userData?.receivedRequests?.length) {
        const requestsPromises = userData.receivedRequests.map(async (requesterId: string) => {
          const requesterDoc = await getDoc(doc(db, 'users', requesterId));
          return { id: requesterDoc.id, ...requesterDoc.data() } as User;
        });
        const requestsList = await Promise.all(requestsPromises);
        setPendingRequests(requestsList);
      } else {
        setPendingRequests([]);
      }
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Failed to load data. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleAcceptRequest = async (requesterId: string) => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      // Update current user's document
      const currentUserRef = doc(db, 'users', currentUser.uid);
      await updateDoc(currentUserRef, {
        buddies: arrayUnion(requesterId),
        receivedRequests: arrayRemove(requesterId)
      });

      // Update requester's document
      const requesterRef = doc(db, 'users', requesterId);
      await updateDoc(requesterRef, {
        buddies: arrayUnion(currentUser.uid),
        sentRequests: arrayRemove(currentUser.uid)
      });

      // Refresh data
      loadData();
    } catch (err) {
      console.error('Error accepting request:', err);
      setError('Failed to accept request. Please try again.');
    }
  };

  const handleRejectRequest = async (requesterId: string) => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      // Update current user's document
      const currentUserRef = doc(db, 'users', currentUser.uid);
      await updateDoc(currentUserRef, {
        receivedRequests: arrayRemove(requesterId)
      });

      // Update requester's document
      const requesterRef = doc(db, 'users', requesterId);
      await updateDoc(requesterRef, {
        sentRequests: arrayRemove(currentUser.uid)
      });

      // Refresh data
      loadData();
    } catch (err) {
      console.error('Error rejecting request:', err);
      setError('Failed to reject request. Please try again.');
    }
  };

  const renderBuddyItem = ({ item }: { item: User }) => (
    <TouchableOpacity 
      style={styles.buddyCard}
      onPress={() => {
        console.log('Navigating to buddy profile with ID:', item.id);
        // Navigate to the Profile tab with the buddy's ID
        navigation.navigate('AppTabs', { 
          screen: 'Profile',
          params: { 
            screen: 'Profile',
            params: { userId: item.id }
          }
        });
      }}
    >
      <Image 
        source={{ 
          uri: item.photoURL || 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y',
          cache: 'force-cache'
        }} 
        style={styles.avatar} 
      />
      <View style={styles.buddyInfo}>
        <Text style={styles.buddyName}>{item.name || 'Buddy'}</Text>
        {item.fitnessLevel && (
          <Text style={styles.buddyDetail}> {item.fitnessLevel}</Text>
        )}
        {item.workoutTypes && item.workoutTypes.length > 0 && (
          <Text style={styles.buddyDetail}>
             {item.workoutTypes.slice(0, 2).join(', ')}
            {item.workoutTypes.length > 2 ? '...' : ''}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderRequestItem = ({ item }: { item: User }) => (
    <View style={styles.requestCard}>
      <Image 
        source={{ 
          uri: item.photoURL || 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y',
          cache: 'force-cache'
        }} 
        style={styles.avatar} 
      />
      <View style={styles.requestInfo}>
        <Text style={styles.buddyName}>{item.name || 'Anonymous User'}</Text>
        <View style={styles.requestButtons}>
          <TouchableOpacity 
            style={[styles.button, styles.acceptButton]}
            onPress={() => handleAcceptRequest(item.id)}
          >
            <Text style={styles.buttonText}>Accept</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.button, styles.rejectButton]}
            onPress={() => handleRejectRequest(item.id)}
          >
            <Text style={styles.buttonText}>Reject</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  if (loading && !refreshing) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Pending Requests Section */}
      {pendingRequests.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pending Requests</Text>
          <FlatList
            data={pendingRequests}
            renderItem={renderRequestItem}
            keyExtractor={item => `request-${item.id}`}
            scrollEnabled={false}
          />
        </View>
      )}

      {/* Buddies Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          {buddies.length > 0 ? 'Your Buddies' : 'No Buddies Yet'}
        </Text>
        {buddies.length > 0 ? (
          <FlatList
            data={buddies}
            renderItem={renderBuddyItem}
            keyExtractor={item => `buddy-${item.id}`}
            scrollEnabled={false}
          />
        ) : (
          <Text style={styles.emptyText}>
            Find and add buddies in the Find Buddy tab!
          </Text>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: {
    marginBottom: 20,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
  buddyCard: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  requestCard: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
  },
  buddyInfo: {
    flex: 1,
  },
  requestInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  requestButtons: {
    flexDirection: 'row',
  },
  button: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginLeft: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  acceptButton: {
    backgroundColor: '#4CAF50',
  },
  rejectButton: {
    backgroundColor: '#F44336',
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  buddyName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  buddyDetail: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    padding: 20,
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    marginTop: 20,
    fontSize: 16,
    padding: 20,
  },
});

export default MyBuddiesScreen;
