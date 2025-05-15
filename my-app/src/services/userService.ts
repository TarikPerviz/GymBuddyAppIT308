import { db } from '../config/firebase';
import { doc, setDoc, getDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';

export interface UserProfile {
  id?: string;
  email: string;
  name: string;
  workoutTypes?: string[];
  fitnessLevel?: 'Beginner' | 'Intermediate' | 'Advanced' | undefined;
  availability?: string[];
  bio?: string;
  avatarIndex?: number; // Index of the avatar in the local assets array
  createdAt?: string;
  updatedAt?: string;
}

export const createUserProfile = async (userId: string, userData: Omit<UserProfile, 'id'>): Promise<UserProfile> => {
  try {
    const userRef = doc(db, 'users', userId);
    const timestamp = new Date().toISOString();
    
    const userProfile = {
      ...userData,
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    
    await setDoc(userRef, userProfile);
    return { id: userId, ...userProfile };
  } catch (error) {
    console.error('Error creating user profile:', error);
    throw error;
  }
};

export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      return { id: userDoc.id, ...userDoc.data() } as UserProfile;
    }
    
    return null;
  } catch (error) {
    console.error('userService: Error getting user profile:', error);
    throw error;
  }
};

export const updateUserProfile = async (userId: string, updates: Partial<UserProfile>): Promise<UserProfile> => {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    const timestamp = new Date().toISOString();
    
    if (userDoc.exists()) {
      await updateDoc(userRef, {
        ...updates,
        updatedAt: timestamp,
      });
    } else {
      await setDoc(userRef, {
        ...updates,
        createdAt: timestamp,
        updatedAt: timestamp,
      });
    }
    
    // Return the updated profile
    const updatedProfile = await getUserProfile(userId);
    if (!updatedProfile) {
      throw new Error('Failed to retrieve updated profile');
    }
    
    return updatedProfile;
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

export const searchUsers = async (searchCriteria: {
  workoutTypes?: string[];
  fitnessLevel?: string;
  availability?: string[];
}): Promise<UserProfile[]> => {
  try {
    const usersRef = collection(db, 'users');
    let q = query(usersRef);
    
    // Note: Firebase has limitations with multiple 'array-contains-any' queries
    // For complex queries, you might need to restructure your data or use a different approach
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as UserProfile[];
  } catch (error) {
    console.error('Error searching users:', error);
    throw error;
  }
};