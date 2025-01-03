import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyATXKywtpgCZHE9lq-OPJWjrdXVVdQLVSI",
  authDomain: "balance-management-project.firebaseapp.com",
  projectId: "balance-management-project",
  storageBucket: "balance-management-project.firebasestorage.app",
  messagingSenderId: "209184934170",
  appId: "1:209184934170:web:fa74b7671e88404dcc84a3"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
