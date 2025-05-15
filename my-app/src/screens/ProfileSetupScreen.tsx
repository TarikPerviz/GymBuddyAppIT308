import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import { RootStackParamList } from '../navigation/types';

// Use 'any' as a temporary workaround for navigation type issues
// In a production app, you'd want to properly type all your navigation routes
type ProfileSetupScreenNavigationProp = NativeStackNavigationProp<any>;

type FitnessLevel = 'Beginner' | 'Intermediate' | 'Advanced';
const fitnessLevels: FitnessLevel[] = ['Beginner', 'Intermediate', 'Advanced'];
type WorkoutType = 'Weightlifting' | 'Cardio' | 'Yoga' | 'CrossFit' | 'Running' | 'Cycling' | 'Swimming' | 'HIIT' | 'Pilates' | 'Calisthenics';

const workoutTypes: WorkoutType[] = [
  'Weightlifting', 'Cardio', 'Yoga', 'CrossFit', 'Running', 
  'Cycling', 'Swimming', 'HIIT', 'Pilates', 'Calisthenics'
];

const ProfileSetupScreen: React.FC = () => {
  const { updateProfile } = useAuth();
  const navigation = useNavigation<ProfileSetupScreenNavigationProp>();
  
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [fitnessLevel, setFitnessLevel] = useState<FitnessLevel | ''>('');
  const [selectedWorkouts, setSelectedWorkouts] = useState<WorkoutType[]>([]);
  const [loading, setLoading] = useState(false);

  const toggleWorkout = (workout: WorkoutType) => {
    setSelectedWorkouts(prev => {
      if (prev.includes(workout)) {
        return prev.filter(w => w !== workout);
      } else {
        return [...prev, workout];
      }
    });
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
      
      // Create the profile update object
      const profileUpdate = {
        name: name.trim(),
        bio: bio.trim(),
        fitnessLevel: fitnessLevel as 'Beginner' | 'Intermediate' | 'Advanced',
        workoutTypes: selectedWorkouts,
        updatedAt: new Date().toISOString()
      };
      
      // Update the profile and wait for it to complete
      await updateProfile(profileUpdate);
      
      // The AuthProvider will detect the profile update and automatically
      // redirect to the main app through the AppNavigator
      
    } catch (error: any) {
      let errorMessage = 'Failed to update profile. Please try again.';
      if (error.message) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.title}>Complete Your Profile</Text>
      <Text style={styles.subtitle}>Help us find the perfect workout buddies for you</Text>
      
      <View style={styles.formGroup}>
        <Text style={styles.label}>Full Name</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="John Doe"
          placeholderTextColor="#999"
        />
      </View>
      
      <View style={styles.formGroup}>
        <Text style={styles.label}>Bio (Optional)</Text>
        <TextInput
          style={[styles.input, styles.bioInput]}
          value={bio}
          onChangeText={setBio}
          placeholder="Tell us about yourself and your fitness goals..."
          placeholderTextColor="#999"
          multiline
          numberOfLines={3}
        />
      </View>
      
      <View style={styles.formGroup}>
        <Text style={styles.label}>Fitness Level</Text>
        <View style={styles.levelContainer}>
          {fitnessLevels.map((level: 'Beginner' | 'Intermediate' | 'Advanced') => (
            <TouchableOpacity
              key={level}
              style={[
                styles.levelButton,
                fitnessLevel === level && styles.levelButtonActive
              ]}
              onPress={() => setFitnessLevel(level)}
            >
              <Text style={[
                styles.levelButtonText,
                fitnessLevel === level && styles.levelButtonTextActive
              ]}>
                {level}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      
      <View style={styles.formGroup}>
        <Text style={styles.label}>Workout Preferences</Text>
        <Text style={styles.hint}>Select all that apply</Text>
        <View style={styles.workoutContainer}>
          {workoutTypes.map((workout) => (
            <TouchableOpacity
              key={workout}
              style={[
                styles.workoutButton,
                selectedWorkouts.includes(workout) && styles.workoutButtonActive
              ]}
              onPress={() => toggleWorkout(workout)}
            >
              <Text style={[
                styles.workoutButtonText,
                selectedWorkouts.includes(workout) && styles.workoutButtonTextActive
              ]}>
                {workout}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      
      <TouchableOpacity 
        style={[styles.submitButton, loading && styles.submitButtonDisabled]}
        onPress={handleSubmit}
        disabled={loading}
      >
        <Text style={styles.submitButtonText}>
          {loading ? 'Saving...' : 'Complete Setup'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  contentContainer: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
  },
  formGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  hint: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
  },
  bioInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  levelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  levelButton: {
    flex: 1,
    marginHorizontal: 4,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
  },
  levelButtonActive: {
    backgroundColor: '#4285f4',
  },
  levelButtonText: {
    color: '#666',
    fontWeight: '500',
  },
  levelButtonTextActive: {
    color: '#fff',
  },
  workoutContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
    marginTop: 8,
  },
  workoutButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: '#f5f5f5',
    margin: 4,
  },
  workoutButtonActive: {
    backgroundColor: '#4285f4',
  },
  workoutButtonText: {
    color: '#666',
    fontSize: 14,
  },
  workoutButtonTextActive: {
    color: '#fff',
  },
  submitButton: {
    backgroundColor: '#4285f4',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 32,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ProfileSetupScreen;
