// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {getAuth} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBIuf12bO9PdsbrvEAyhx5_0rhNY85obiQ",
  authDomain: "caretransact.firebaseapp.com",
  projectId: "caretransact",
  storageBucket: "caretransact.firebasestorage.app",
  messagingSenderId: "770606370732",
  appId: "1:770606370732:web:a4e8b16759343298963409"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth=getAuth();
export const db=getFirestore(app);
export default app;