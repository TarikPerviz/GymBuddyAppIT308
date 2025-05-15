// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDwTy30klhMLDMOySVdNG7z-WjhzL8qZ-Y",
  authDomain: "gym-buddy-app-66bff.firebaseapp.com",
  projectId: "gym-buddy-app-66bff",
  storageBucket: "gym-buddy-app-66bff.appspot.com",
  messagingSenderId: "1033394182279",
  appId: "1:1033394182279:web:f591796132a18c80eb4022"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;