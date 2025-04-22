// firebase/config.ts
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
    apiKey: "AIzaSyDwTy30klhMLDMOySVdNG7z-WjhzL8qZ-Y",
    authDomain: "gym-buddy-app-66bff.firebaseapp.com",
    projectId: "gym-buddy-app-66bff",
    storageBucket: "gym-buddy-app-66bff.firebasestorage.app",
    messagingSenderId: "1033394182279",
    appId: "1:1033394182279:web:f591796132a18c80eb4022"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
