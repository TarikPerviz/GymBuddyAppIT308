import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';

type Workout = {
  id: string;
  name: string;
  duration: string;
  type: string;
  completed: boolean;
};

const WorkoutScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'upcoming' | 'history'>('upcoming');
  
  // Mock workout data
  const [workouts, setWorkouts] = useState<Workout[]>([
    {
      id: '1',
      name: 'Morning Cardio',
      duration: '30 min',
      type: 'Cardio',
      completed: false,
    },
    {
      id: '2',
      name: 'Chest & Triceps',
      duration: '45 min',
      type: 'Strength',
      completed: false,
    },
    {
      id: '3',
      name: 'Leg Day',
      duration: '50 min',
      type: 'Strength',
      completed: true,
    },
  ]);

  const toggleWorkoutCompletion = (id: string) => {
    setWorkouts(workouts.map(workout => 
      workout.id === id ? { ...workout, completed: !workout.completed } : workout
    ));
  };

  const filteredWorkouts = workouts.filter(workout => 
    activeTab === 'upcoming' ? !workout.completed : workout.completed
  );

  const renderWorkoutItem = ({ item }: { item: Workout }) => (
    <View style={[styles.workoutCard, item.completed && styles.completedWorkout]}>
      <View style={styles.workoutInfo}>
        <Text style={styles.workoutName}>{item.name}</Text>
        <View style={styles.workoutDetails}>
          <Text style={styles.workoutDetail}>{item.type}</Text>
          <Text style={styles.workoutDetail}>•</Text>
          <Text style={styles.workoutDetail}>{item.duration}</Text>
        </View>
      </View>
      <TouchableOpacity 
        style={[styles.actionButton, item.completed ? styles.completedButton : styles.startButton]}
        onPress={() => toggleWorkoutCompletion(item.id)}
      >
        <Text style={styles.actionButtonText}>
          {item.completed ? 'Completed' : 'Start'}
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.tabs}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'upcoming' && styles.activeTab]}
          onPress={() => setActiveTab('upcoming')}
        >
          <Text style={[styles.tabText, activeTab === 'upcoming' && styles.activeTabText]}>
            Upcoming
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'history' && styles.activeTab]}
          onPress={() => setActiveTab('history')}
        >
          <Text style={[styles.tabText, activeTab === 'history' && styles.activeTabText]}>
            History
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredWorkouts}
        renderItem={renderWorkoutItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            {activeTab === 'upcoming' 
              ? 'No upcoming workouts' 
              : 'No workout history yet'}
          </Text>
        }
      />

      <TouchableOpacity style={styles.addButton}>
        <Text style={styles.addButtonText}>+ Add Workout</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 10,
    marginBottom: 16,
    overflow: 'hidden',
  },
  tab: {
    flex: 1,
    padding: 15,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: '#4285f4',
  },
  tabText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  activeTabText: {
    color: 'white',
  },
  listContent: {
    paddingBottom: 20,
  },
  workoutCard: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
    elevation: 2,
  },
  completedWorkout: {
    opacity: 0.7,
  },
  workoutInfo: {
    flex: 1,
  },
  workoutName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  workoutDetails: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  workoutDetail: {
    fontSize: 14,
    color: '#666',
    marginRight: 8,
  },
  actionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    minWidth: 80,
    alignItems: 'center',
  },
  startButton: {
    backgroundColor: '#34a853',
  },
  completedButton: {
    backgroundColor: '#e0e0e0',
  },
  actionButtonText: {
    color: 'white',
    fontWeight: '500',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 40,
    fontSize: 16,
    color: '#666',
  },
  addButton: {
    backgroundColor: '#4285f4',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default WorkoutScreen;
