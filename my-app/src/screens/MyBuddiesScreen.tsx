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
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 16,
    paddingTop: 44,
    paddingBottom: 0,
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: {
    marginBottom: 24,
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
    color: '#357abd',
    letterSpacing: 0.2,
  },
  buddyCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    alignItems: 'center',
    shadowColor: '#357abd',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 6,
    elevation: 3,
    borderLeftWidth: 4,
    borderLeftColor: '#357abd',
  },
  requestCard: {
    flexDirection: 'row',
    backgroundColor: '#f0f6ff',
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#357abd',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
    width: '100%',
    borderLeftWidth: 4,
    borderLeftColor: '#fbc531',
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginRight: 16,
    borderWidth: 2,
    borderColor: '#357abd',
  },
  buddyInfo: {
    flex: 1,
  },
  requestInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  requestButtons: {
    flexDirection: 'row',
    marginLeft: 8,
    flexShrink: 1,
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 24,
    marginLeft: 8,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 90,
    elevation: 1,
  },
  acceptButton: {
    backgroundColor: '#44bd32',
  },
  rejectButton: {
    backgroundColor: '#e84118',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
    letterSpacing: 0.3,
  },
  buddyName: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 2,
    color: '#2d3436',
    maxWidth: '60%',
    letterSpacing: 0.2,
  },
  buddyDetail: {
    fontSize: 14,
    color: '#357abd',
    marginBottom: 2,
    fontWeight: '500',
  },
  errorText: {
    color: '#e84118',
    textAlign: 'center',
    padding: 20,
    fontWeight: '700',
    fontSize: 16,
    letterSpacing: 0.2,
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    marginTop: 20,
    fontSize: 16,
    padding: 20,
    fontWeight: '500',
    letterSpacing: 0.2,
  },
});

export default MyBuddiesScreen;
