import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth'; 
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyBcElRfIHAiQGqJvDyPCAnz8KCOYsWDVhc",
  authDomain: "internship-project-d0279.firebaseapp.com",
  projectId: "internship-project-d0279",
  storageBucket: "internship-project-d0279.firebasestorage.app",
  messagingSenderId: "25251313857",
  appId: "1:25251313857:web:bc513b3cef73059259fc40",
  measurementId: "G-PZ6RGQWLVM"
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app); 
const db = getFirestore(app);
const storage = getStorage(app);

export { auth, db, storage }; 
