import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';

const workoutTypes = [
  'Weightlifting', 'Cardio', 'Yoga', 'CrossFit', 'Running', 
  'Cycling', 'Swimming', 'HIIT', 'Pilates', 'Calisthenics'
];

const fitnessLevels = ['Beginner', 'Intermediate', 'Advanced'];

const EditProfileScreen: React.FC = () => {
  const { userProfile, updateProfile } = useAuth();
  const navigation = useNavigation();
  const [name, setName] = useState(userProfile?.name || '');
  const [bio, setBio] = useState(userProfile?.bio || '');
  const [fitnessLevel, setFitnessLevel] = useState(userProfile?.fitnessLevel || '');
  const [selectedWorkouts, setSelectedWorkouts] = useState<string[]>(userProfile?.workoutTypes || []);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setName(userProfile?.name || '');
    setBio(userProfile?.bio || '');
    setFitnessLevel(userProfile?.fitnessLevel || '');
    setSelectedWorkouts(userProfile?.workoutTypes || []);
  }, [userProfile]);

  const toggleWorkout = (workout: string) => {
    setSelectedWorkouts(prev =>
      prev.includes(workout) ? prev.filter(w => w !== workout) : [...prev, workout]
    );
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter your name');
      return;
    }
    if (!fitnessLevel) {
      Alert.alert('Error', 'Please select your fitness level');
      return;
    }
    try {
      setLoading(true);
      await updateProfile({
        name: name.trim(),
        bio: bio.trim(),
        fitnessLevel,
        workoutTypes: selectedWorkouts,
        updatedAt: new Date().toISOString()
      });
      Alert.alert('Success', 'Profile updated successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Edit Profile</Text>
      <TextInput
        style={styles.input}
        placeholder="Name"
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={styles.input}
        placeholder="Bio"
        value={bio}
        onChangeText={setBio}
        multiline
      />
      <Text style={styles.label}>Fitness Level</Text>
      <View style={styles.row}>
        {fitnessLevels.map(level => (
          <TouchableOpacity
            key={level}
            style={[styles.levelButton, fitnessLevel === level && styles.levelButtonActive]}
            onPress={() => setFitnessLevel(level)}
          >
            <Text style={[styles.levelButtonText, fitnessLevel === level && styles.levelButtonTextActive]}>{level}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <Text style={styles.label}>Workout Types</Text>
      <View style={styles.workoutsContainer}>
        {workoutTypes.map(workout => (
          <TouchableOpacity
            key={workout}
            style={[styles.workoutButton, selectedWorkouts.includes(workout) && styles.workoutButtonActive]}
            onPress={() => toggleWorkout(workout)}
          >
            <Text style={[styles.workoutButtonText, selectedWorkouts.includes(workout) && styles.workoutButtonTextActive]}>{workout}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <TouchableOpacity
        style={[styles.submitButton, loading && styles.submitButtonDisabled]}
        onPress={handleSubmit}
        disabled={loading}
      >
        <Text style={styles.submitButtonText}>{loading ? 'Saving...' : 'Save Changes'}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 20 },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 24, textAlign: 'center', color: '#333' },
  input: { backgroundColor: '#f5f5f5', padding: 15, borderRadius: 8, marginBottom: 15, fontSize: 16 },
  label: { fontSize: 16, fontWeight: '600', marginBottom: 8, color: '#333' },
  row: { flexDirection: 'row', marginBottom: 16 },
  levelButton: { backgroundColor: '#e0e0e0', padding: 10, borderRadius: 8, marginRight: 10 },
  levelButtonActive: { backgroundColor: '#007AFF' },
  levelButtonText: { color: '#333', fontWeight: '500' },
  levelButtonTextActive: { color: '#fff' },
  workoutsContainer: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 20 },
  workoutButton: { backgroundColor: '#e0e0e0', padding: 8, borderRadius: 8, margin: 4 },
  workoutButtonActive: { backgroundColor: '#007AFF' },
  workoutButtonText: { color: '#333' },
  workoutButtonTextActive: { color: '#fff' },
  submitButton: { backgroundColor: '#007AFF', padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 16 },
  submitButtonDisabled: { backgroundColor: '#cccccc' },
  submitButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});

export default EditProfileScreen;
