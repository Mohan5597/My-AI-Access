import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = { 
  apiKey: "AIzaSyD-9XOMejQLGex-vRALMaNX6Qti-ZIUXgk",
  authDomain: "ai-access-control-36f8a.firebaseapp.com",
  projectId: "ai-access-control-36f8a",
  storageBucket: "ai-access-control-36f8a.firebasestorage.app",
  messagingSenderId: "484421610438",
  appId: "1:484421610438:web:305e8db474408b91db20c7",
  measurementId: "G-V4V616B4LD"

 };

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);