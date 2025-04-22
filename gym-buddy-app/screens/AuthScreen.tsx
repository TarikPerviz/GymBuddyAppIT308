import React, { useState } from 'react';
import { View, TextInput, Button, Text, StyleSheet, Alert } from 'react-native';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase/config';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigator';

type AuthScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Auth'>;

export default function AuthScreen() {
  const navigation = useNavigation<AuthScreenNavigationProp>();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleAuth = async () => {
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
        navigation.replace('Home');
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
        navigation.replace('ProfileSetup');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };
  

  return (
    <View style={styles.container}>
      <Text style={styles.header}>{isLogin ? 'Login' : 'Sign Up'}</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        autoCapitalize="none"
        onChangeText={setEmail}
        value={email}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        onChangeText={setPassword}
        value={password}
      />
      <Button title={isLogin ? 'Login' : 'Sign Up'} onPress={handleAuth} />
      <Text style={styles.toggleText} onPress={() => setIsLogin(!isLogin)}>
        {isLogin ? "Don't have an account? Sign Up" : 'Already have an account? Login'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20 },
  header: { fontSize: 24, textAlign: 'center', marginBottom: 20 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 12,
    marginBottom: 12,
    borderRadius: 6,
  },
  toggleText: {
    color: 'blue',
    textAlign: 'center',
    marginTop: 15,
  },
});
