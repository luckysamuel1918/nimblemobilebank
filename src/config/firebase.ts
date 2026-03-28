
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCn2PUHZDw68QjuAnampeB4JAgX3NXN2qk",
  authDomain: "averyship-8cb22.firebaseapp.com",
  projectId: "averyship-8cb22",
  storageBucket: "averyship-8cb22.firebasestorage.app",
  appId: "1:226373958517:web:503bd9e98e065c9a15b13c",
  measurementId: "G-JFW62N3MR3"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
