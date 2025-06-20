import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, Image, ActivityIndicator, ScrollView, Modal, TouchableWithoutFeedback } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
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

const workoutTypes = [
  'Weightlifting', 'Cardio', 'Yoga', 'CrossFit', 'Pilates',
  'HIIT', 'Running', 'Cycling', 'Swimming', 'Boxing',
  'Martial Arts', 'Dance', 'Plyometrics', 'Calisthenics'
];

const fitnessLevels = ['Beginner', 'Intermediate', 'Advanced'];

const FindBuddyScreen: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sendingRequest, setSendingRequest] = useState<Record<string, boolean>>({});
  const [showFilters, setShowFilters] = useState(false);
  const [selectedWorkoutTypes, setSelectedWorkoutTypes] = useState<string[]>([]);
  const [selectedFitnessLevel, setSelectedFitnessLevel] = useState<string>('');
  const [isFitnessLevelDropdownOpen, setIsFitnessLevelDropdownOpen] = useState(false);

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
    // Search filter
    const matchesSearch = !searchQuery || [
      user.name?.toLowerCase(),
      user.preferredGym?.toLowerCase(),
      user.location?.toLowerCase(),
      user.bio?.toLowerCase(),
      user.workoutTypes?.join(' ').toLowerCase(),
      user.fitnessLevel?.toLowerCase()
    ].some(field => field?.includes(searchQuery.toLowerCase()));

    // Workout types filter
    const matchesWorkoutTypes = selectedWorkoutTypes.length === 0 || 
      selectedWorkoutTypes.some(type => 
        user.workoutTypes?.some(wt => wt.toLowerCase() === type.toLowerCase())
      );

    // Fitness level filter
    const matchesFitnessLevel = !selectedFitnessLevel || 
      user.fitnessLevel?.toLowerCase() === selectedFitnessLevel.toLowerCase();

    return matchesSearch && matchesWorkoutTypes && matchesFitnessLevel;
  });

  const toggleWorkoutType = (type: string) => {
    setSelectedWorkoutTypes(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  const toggleFitnessLevel = (level: string) => {
    setSelectedFitnessLevel(prev => prev === level ? '' : level);
    setIsFitnessLevelDropdownOpen(false);
  };

  const clearFilters = () => {
    setSelectedWorkoutTypes([]);
    setSelectedFitnessLevel('');
    setSearchQuery('');
  };

  const activeFiltersCount = 
    (searchQuery ? 1 : 0) + 
    selectedWorkoutTypes.length + 
    (selectedFitnessLevel ? 1 : 0);

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#357abd" />
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
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#999"
          />
        </View>
        <TouchableOpacity 
          style={[styles.filterButton, activeFiltersCount > 0 && styles.filterButtonActive]}
          onPress={() => setShowFilters(true)}
        >
          <Ionicons 
            name="filter" 
            size={20} 
            color={activeFiltersCount > 0 ? '#fff' : '#007AFF'} 
          />
          {activeFiltersCount > 0 && (
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>{activeFiltersCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
      
      <FlatList
        data={filteredBuddies}
        renderItem={renderBuddyItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No buddies found. Try adjusting your filters.</Text>
          </View>
        }
      />

      {/* Filter Modal */}
      <Modal
        visible={showFilters}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowFilters(false)}
      >
        <TouchableWithoutFeedback onPress={() => setShowFilters(false)}>
          <View style={styles.modalOverlay} />
        </TouchableWithoutFeedback>
        
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Filters</Text>
            <TouchableOpacity onPress={() => setShowFilters(false)}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.filterContainer}>
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Workout Types</Text>
              <View style={styles.workoutTypesContainer}>
                {workoutTypes.map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.workoutTypeItem,
                      selectedWorkoutTypes.includes(type) && styles.workoutTypeItemSelected
                    ]}
                    onPress={() => toggleWorkoutType(type)}
                  >
                    <Text style={[
                      styles.workoutTypeText,
                      selectedWorkoutTypes.includes(type) && styles.workoutTypeTextSelected
                    ]}>
                      {type}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Fitness Level</Text>
              <View style={styles.fitnessLevelContainer}>
                {fitnessLevels.map((level) => (
                  <TouchableOpacity
                    key={level}
                    style={[
                      styles.fitnessLevelItem,
                      selectedFitnessLevel === level && styles.fitnessLevelItemSelected
                    ]}
                    onPress={() => toggleFitnessLevel(level)}
                  >
                    <Text style={[
                      styles.fitnessLevelText,
                      selectedFitnessLevel === level && styles.fitnessLevelTextSelected
                    ]}>
                      {level}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </ScrollView>
          
          <View style={styles.modalFooter}>
            <TouchableOpacity 
              style={styles.clearButton}
              onPress={clearFilters}
            >
              <Text style={styles.clearButtonText}>Clear All</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.applyButton}
              onPress={() => setShowFilters(false)}
            >
              <Text style={styles.applyButtonText}>Show Results</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingTop: 44,
    padding: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'center',
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 48,
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    fontSize: 16,
    color: '#333',
    borderRadius: 8,
    padding: 12,
  },
  filterButton: {
    width: 48,
    height: 48,
    borderRadius: 10,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  filterButtonActive: {
    backgroundColor: '#007AFF',
  },
  filterBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#FF3B30',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  filterBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 16,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#f8f9fa',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 28,
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.10,
    shadowRadius: 12,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#357abd',
    letterSpacing: 0.3,
  },
  filterContainer: {
    marginBottom: 20,
  },
  filterSection: {
    marginBottom: 24,
  },
  filterSectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#357abd',
    marginBottom: 12,
    letterSpacing: 0.2,
  },
  workoutTypesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  workoutTypeItem: {
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 20,
    backgroundColor: '#e3eafc',
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#d0d7e2',
  },
  workoutTypeItemSelected: {
    backgroundColor: '#357abd',
    borderColor: '#357abd',
  },
  workoutTypeText: {
    fontSize: 14,
    color: '#357abd',
    fontWeight: '500',
  },
  workoutTypeTextSelected: {
    color: '#fff',
    fontWeight: '600',
  },
  fitnessLevelContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  fitnessLevelItem: {
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 20,
    backgroundColor: '#e3eafc',
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#d0d7e2',
  },
  fitnessLevelItemSelected: {
    backgroundColor: '#357abd',
    borderColor: '#357abd',
  },
  fitnessLevelText: {
    fontSize: 14,
    color: '#357abd',
    fontWeight: '500',
  },
  fitnessLevelTextSelected: {
    color: '#fff',
    fontWeight: '600',
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  clearButton: {
    padding: 12,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#357abd',
    flex: 1,
    marginRight: 8,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  clearButtonText: {
    color: '#357abd',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  applyButton: {
    flex: 1,
    backgroundColor: '#357abd',
    padding: 12,
    borderRadius: 20,
    alignItems: 'center',
    marginLeft: 8,
  },
  applyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  buddyCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
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
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 6,
    color: '#2d3436',
    fontFamily: 'System',
    letterSpacing: 0.2,
  },
  buddyDetail: {
    fontSize: 14,
    color: '#4a90e2',
    marginBottom: 2,
    fontWeight: '500',
  },
  bioText: {
    color: '#666',
    fontSize: 14,
    marginTop: 4,
    fontStyle: 'italic',
  },
  connectButton: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 24,
    backgroundColor: '#357abd',
    marginLeft: 12,
    shadowColor: '#357abd',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.18,
    shadowRadius: 2,
    elevation: 2,
  },
  listContent: {
    paddingBottom: 20,
  },
  connectButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  buttonDisabled: {
    backgroundColor: '#b2bec3',
  },
  pendingButton: {
    backgroundColor: '#fbc531',
  },
  pendingText: {
    color: '#222f3e',
    fontSize: 15,
    fontWeight: '700',
  },
  buddiesButton: {
    backgroundColor: '#44bd32',
  },
  buddiesText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
});

export default FindBuddyScreen;
