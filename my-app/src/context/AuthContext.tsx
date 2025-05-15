import React, { createContext, useState, useEffect, ReactNode, useContext } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser,
  UserCredential
} from 'firebase/auth';
import { auth } from '../config/firebase';
import { createUserProfile, getUserProfile, UserProfile, updateUserProfile } from '../services/userService';

export interface AuthContextType {
  currentUser: FirebaseUser | null;
  userProfile: UserProfile | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<UserCredential>;
  signup: (email: string, password: string, name: string) => Promise<UserCredential>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<UserProfile>;
  refreshUserProfile: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      
      if (user) {
        try {
          const profile = await getUserProfile(user.uid);
          
          if (profile) {
            setUserProfile(profile);
          } else {
            const minimalProfile: UserProfile = {
              id: user.uid,
              email: user.email || '',
              name: '', // Start with empty name to force profile setup
              fitnessLevel: 'Beginner',
              workoutTypes: [],
              bio: '',
              availability: [],
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };
            
            setUserProfile(minimalProfile);
          }
        } catch (error) {
          console.error('Error loading user profile:', error);
          setUserProfile(null);
        }
      } else {
        setUserProfile(null);
      }
      
      setLoading(false);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const signup = async (email: string, password: string, name: string) => {
    try {
      console.log('AuthContext: Starting signup for:', email);
      
      // Set loading to true to prevent premature navigation
      setLoading(true);
      
      // Create the user account
      console.log('AuthContext: Creating user account...');
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      if (!userCredential.user) {
        throw new Error('Failed to create user account');
      }
      
      console.log('AuthContext: User account created:', userCredential.user.uid);
      
      // Generate a random avatar index (0-5) for the new user
      const avatarIndex = Math.floor(Math.random() * 6);
      const timestamp = new Date().toISOString();
      
      // Create a minimal profile with empty name to force profile setup
      const newProfile: UserProfile = {
        email,
        name: '', // Start with empty name to force profile setup
        avatarIndex,
        fitnessLevel: 'Beginner',
        workoutTypes: [],
        bio: '',
        availability: [],
        createdAt: timestamp,
        updatedAt: timestamp,
      };
      
      console.log('AuthContext: Creating user profile in Firestore...');
      // Create the user profile in Firestore
      await createUserProfile(userCredential.user.uid, newProfile);
      
      // Update the local state with the new profile
      const updatedProfile = {
        ...newProfile,
        id: userCredential.user.uid
      };
      
      console.log('AuthContext: Updating local profile state');
      setUserProfile(updatedProfile);
      
      console.log('AuthContext: Signup completed successfully');
      return userCredential;
    } catch (error) {
      console.error('Error during signup:', error);
      throw error;
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      // The onAuthStateChanged will handle updating the user profile
      return userCredential;
    } catch (error) {
      console.error('Error during login:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await firebaseSignOut(auth);
    } catch (error) {
      console.error('Error during logout:', error);
      throw error;
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>): Promise<UserProfile> => {
    console.log('AuthContext: updateProfile called with:', updates);
    
    if (!currentUser) {
      const error = new Error('No user is currently logged in');
      console.error('AuthContext: updateProfile error -', error.message);
      throw error;
    }

    try {
      console.log('AuthContext: Updating profile in Firestore...');
      // Get current profile to ensure we don't lose any data
      const currentProfile = await getUserProfile(currentUser.uid) || {};
      
      // Merge updates with current profile data
      const updatedData = {
        ...currentProfile,
        ...updates,
        updatedAt: new Date().toISOString()
      };
      
      // Update the profile in Firestore
      const updatedProfile = await updateUserProfile(currentUser.uid, updatedData);
      
      // Update the local state
      const newProfile = {
        ...currentProfile,
        ...updatedData,
        id: currentUser.uid
      } as UserProfile;
      
      console.log('AuthContext: Updating local profile state with:', newProfile);
      setUserProfile(newProfile);
      
      console.log('AuthContext: Profile updated successfully');
      return newProfile;
    } catch (error) {
      console.error('AuthContext: Error updating profile:', error);
      throw error;
    }
  };

  const refreshUserProfile = async () => {
    if (!currentUser) return;
    
    try {
      const profile = await getUserProfile(currentUser.uid);
      setUserProfile(profile);
    } catch (error) {
      console.error('Error refreshing user profile:', error);
    }
  };

  const value = {
    currentUser,
    userProfile,
    loading,
    login,
    signup,
    logout,
    updateProfile,
    refreshUserProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthContext;