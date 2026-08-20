// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
import {getAuth, GoogleAuthProvider} from "firebase/auth";
// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAt6W61pSwb7B0WOd5yoz1wU48VoOaqLRU",
  authDomain: "internarea-cdedd.firebaseapp.com",
  projectId: "internarea-cdedd",
  storageBucket: "internarea-cdedd.firebasestorage.app",
  messagingSenderId: "1074508918149",
  appId: "1:1074508918149:web:2b12f9471aabb2cf6228ec"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
export {auth, provider};