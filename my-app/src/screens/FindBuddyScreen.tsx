import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, Image } from 'react-native';

// Mock data for potential gym buddies
const potentialBuddies = [
  {
    id: '1',
    name: 'Alex Johnson',
    workoutType: 'Weightlifting',
    level: 'Intermediate',
    availability: 'Weekday evenings',
    image: 'https://randomuser.me/api/portraits/men/32.jpg',
  },
  {
    id: '2',
    name: 'Sarah Miller',
    workoutType: 'Cardio & Yoga',
    level: 'Beginner',
    availability: 'Weekend mornings',
    image: 'https://randomuser.me/api/portraits/women/44.jpg',
  },
  {
    id: '3',
    name: 'Mike Chen',
    workoutType: 'CrossFit',
    level: 'Advanced',
    availability: 'Early mornings',
    image: 'https://randomuser.me/api/portraits/men/22.jpg',
  },
];

const FindBuddyScreen: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredBuddies = potentialBuddies.filter(buddy =>
    buddy.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    buddy.workoutType.toLowerCase().includes(searchQuery.toLowerCase())
  );

  interface Buddy {
    id: string;
    name: string;
    workoutType: string;
    level: string;
    availability: string;
    image: string;
  }

  const renderBuddyItem = ({ item }: { item: Buddy }) => (
    <View style={styles.buddyCard}>
      <Image source={{ uri: item.image }} style={styles.avatar} />
      <View style={styles.buddyInfo}>
        <Text style={styles.buddyName}>{item.name}</Text>
        <Text style={styles.buddyDetail}>🏋️ {item.workoutType}</Text>
        <Text style={styles.buddyDetail}>📊 Level: {item.level}</Text>
        <Text style={styles.buddyDetail}>⏰ {item.availability}</Text>
      </View>
      <TouchableOpacity style={styles.connectButton}>
        <Text style={styles.connectButtonText}>Connect</Text>
      </TouchableOpacity>
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
    padding: 16,
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
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
    elevation: 2,
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
});

export default FindBuddyScreen;
