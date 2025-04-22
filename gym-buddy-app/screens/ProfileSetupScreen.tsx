import React, { useState } from 'react';
import { View, TextInput, Button, Text, StyleSheet, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import { RootStackParamList } from '../navigation/RootNavigator';

export default function ProfileSetupScreen() {
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [goal, setGoal] = useState('Lose weight');
  const [level, setLevel] = useState('Beginner');

  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const auth = getAuth();
  const db = getFirestore();

  const handleSave = async () => {
    if (!name || !age) {
      Alert.alert('Please fill in all fields.');
      return;
    }

    const uid = auth.currentUser?.uid;
    if (!uid) return;

    try {
      await setDoc(doc(db, 'users', uid), {
        name,
        age: Number(age),
        goal,
        level,
        createdAt: new Date(),
      });

      navigation.reset({
        index: 0,
        routes: [{ name: 'Home' }],
      });
      
    } catch (error: any) {
      Alert.alert('Error saving profile', error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Display Name</Text>
      <TextInput style={styles.input} value={name} onChangeText={setName} />

      <Text style={styles.label}>Age</Text>
      <TextInput style={styles.input} value={age} onChangeText={setAge} keyboardType="numeric" />

      <Text style={styles.label}>Fitness Goal</Text>
      <Picker selectedValue={goal} onValueChange={setGoal} style={styles.input}>
        <Picker.Item label="Lose weight" value="Lose weight" />
        <Picker.Item label="Build muscle" value="Build muscle" />
        <Picker.Item label="Stay active" value="Stay active" />
      </Picker>

      <Text style={styles.label}>Experience Level</Text>
      <Picker selectedValue={level} onValueChange={setLevel} style={styles.input}>
        <Picker.Item label="Beginner" value="Beginner" />
        <Picker.Item label="Intermediate" value="Intermediate" />
        <Picker.Item label="Advanced" value="Advanced" />
      </Picker>

      <Button title="Save Profile" onPress={handleSave} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center' },
  label: { fontWeight: 'bold', marginTop: 16 },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 8, borderRadius: 6, marginTop: 4 },
});
