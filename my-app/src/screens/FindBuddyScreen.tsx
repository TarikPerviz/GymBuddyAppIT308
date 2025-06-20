import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { collection, getDocs, query, where, doc, setDoc, updateDoc, arrayUnion, arrayRemove, getDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import { auth } from '../config/firebase';

interface User {
  id: string;
  name?: string;
  photoURL?: string;
  workoutTypes?: string[];
  fitnessLevel?: string;
  preferredGym?: string;
  location?: string;
  bio?: string;
  preferredWorkoutType?: string;
  _id?: string;
  requestStatus?: 'none' | 'pending' | 'accepted';
  goals?: string[];
  experience?: string;
  preferredWorkoutTime?: string;
  preferredWorkoutDays?: string[];
}

const FindBuddyScreen: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sendingRequest, setSendingRequest] = useState<Record<string, boolean>>({});

  const handleSendRequest = async (receiverId: string) => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        setError('You must be logged in to send a buddy request');
        return;
      }

      setSendingRequest(prev => ({ ...prev, [receiverId]: true }));

      // Add to sent requests for current user
      const currentUserRef = doc(db, 'users', currentUser.uid);
      await updateDoc(currentUserRef, {
        sentRequests: arrayUnion(receiverId)
      });

      // Add to received requests for the receiver
      const receiverRef = doc(db, 'users', receiverId);
      await updateDoc(receiverRef, {
        receivedRequests: arrayUnion(currentUser.uid)
      });

      // Update local state
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user.id === receiverId 
            ? { ...user, requestStatus: 'pending' as const }
            : user
        )
      );

    } catch (err) {
      console.error('Error sending buddy request:', err);
      setError('Failed to send buddy request. Please try again.');
    } finally {
      setSendingRequest(prev => ({ ...prev, [receiverId]: false }));
    }
  };

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        console.log('Fetching users...');
        const currentUserId = auth.currentUser?.uid;
        if (!currentUserId) {
          setError('User not authenticated');
          setLoading(false);
          return;
        }
        
        // Get all users except current user
        const usersRef = collection(db, 'users');
        const querySnapshot = await getDocs(usersRef);
        
        // Get current user's sent requests
        const currentUserDoc = await getDoc(doc(db, 'users', currentUserId));
        const sentRequests = currentUserDoc.data()?.sentRequests || [];
        const receivedRequests = currentUserDoc.data()?.receivedRequests || [];
        const buddies = currentUserDoc.data()?.buddies || [];
        
        const usersList = querySnapshot.docs
          .filter(doc => doc.id !== currentUserId) // Filter out current user
          .map(doc => {
            const data = doc.data();
            const userId = doc.id;
            
            // Check request status
            let status: 'none' | 'pending' | 'accepted' = 'none';
            if (buddies.includes(userId)) {
              status = 'accepted';
            } else if (sentRequests.includes(userId)) {
              status = 'pending';
            } else if (receivedRequests.includes(userId)) {
              status = 'pending';
            }
            
            return {
              id: userId,
              ...data,
              requestStatus: status
            } as User & { requestStatus: 'none' | 'pending' | 'accepted' };
          });
        
        console.log('Filtered users list:', usersList);
        setUsers(usersList);
      } catch (err) {
        console.error('Error fetching users:', err);
        setError(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const filteredBuddies = users.filter(user => {
    if (!searchQuery) return true;
    const searchLower = searchQuery.toLowerCase();
    return (
      user.name?.toLowerCase().includes(searchLower) ||
      user.workoutTypes?.some(type => type.toLowerCase().includes(searchLower)) ||
      user.fitnessLevel?.toLowerCase().includes(searchLower) ||
      user.preferredWorkoutType?.toLowerCase().includes(searchLower) ||
      user.preferredGym?.toLowerCase().includes(searchLower) ||
      user.bio?.toLowerCase().includes(searchLower) ||
      user.location?.toLowerCase().includes(searchLower)
    );
  });

  if (loading) {
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

  const renderBuddyItem = ({ item }: { item: User }) => (
    <View style={styles.buddyCard}>
      <Image 
        source={{ 
          uri: item.photoURL || 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y',
          cache: 'force-cache'
        }} 
        style={styles.avatar} 
        defaultSource={{ uri: 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y' }}
      />
      <View style={styles.buddyInfo}>
        <Text style={styles.buddyName}>{item.name || 'Anonymous User'}</Text>
        {item.workoutTypes && item.workoutTypes.length > 0 && (
          <Text style={styles.buddyDetail}>🏋️ {item.workoutTypes.join(', ')}</Text>
        )}
        {item.fitnessLevel && (
          <Text style={styles.buddyDetail}>📊 {item.fitnessLevel}</Text>
        )}
        {item.preferredGym && (
          <Text style={styles.buddyDetail}>🏢 {item.preferredGym}</Text>
        )}
        {item.location && (
          <Text style={styles.buddyDetail}>📍 {item.location}</Text>
        )}
        {item.bio && (
          <Text style={styles.bioText} numberOfLines={2}>
            {item.bio.length > 100 ? `${item.bio.substring(0, 100)}...` : item.bio}
          </Text>
        )}
      </View>
      {item.requestStatus === 'none' ? (
        <TouchableOpacity 
          style={[styles.connectButton, sendingRequest[item.id] && styles.buttonDisabled]}
          onPress={() => handleSendRequest(item.id)}
          disabled={sendingRequest[item.id]}
        >
          <Text style={styles.connectButtonText}>
            {sendingRequest[item.id] ? 'Sending...' : 'Add Buddy'}
          </Text>
        </TouchableOpacity>
      ) : item.requestStatus === 'pending' ? (
        <View style={[styles.connectButton, styles.pendingButton]}>
          <Text style={styles.pendingText}>Request Sent</Text>
        </View>
      ) : (
        <View style={[styles.connectButton, styles.buddiesButton]}>
          <Text style={styles.buddiesText}>Buddies</Text>
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchInput}
        placeholder="Search by name or workout type..."
        value={searchQuery}
        onChangeText={setSearchQuery}
      />
      
      <FlatList
        data={filteredBuddies}
        renderItem={renderBuddyItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingTop: 44, // Add extra padding at the top for status bar
    padding: 16,
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    textAlign: 'center',
    marginHorizontal: 20,
  },
  bioText: {
    color: '#666',
    fontSize: 14,
    marginTop: 4,
    fontStyle: 'italic',
  },
  searchInput: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  listContent: {
    paddingBottom: 20,
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
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
  },
  buddyInfo: {
    flex: 1,
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
  connectButton: {
    backgroundColor: '#4285f4',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  connectButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  pendingButton: {
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#ccc',
  },
  pendingText: {
    color: '#666',
    fontWeight: '500',
  },
  buddiesButton: {
    backgroundColor: '#e3f2fd',
    borderWidth: 1,
    borderColor: '#bbdefb',
  },
  buddiesText: {
    color: '#1976d2',
    fontWeight: '500',
  },
});

export default FindBuddyScreen;
