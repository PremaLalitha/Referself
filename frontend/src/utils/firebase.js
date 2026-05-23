import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  // IMPORTANT: If you see "API key not valid" errors, replace the apiKey below
  // with the Web API key from your Firebase project settings (Project Settings -> General -> Your apps -> Config).
  // Also ensure the key's restrictions (if any) allow requests from your dev origin (e.g. http://localhost:5173).
  apiKey: "AIzaSyBdlfg6vzvmadqNqNutP4WY6c752S6T89g",
  authDomain: "referself-3e3f7.firebaseapp.com",
  projectId: "referself-3e3f7",
  // Correct storageBucket hostname for Firebase (common typo: should end with appspot.com)
  storageBucket: "referself-3e3f7.appspot.com",
  messagingSenderId: "199974131781",
  appId: "1:199974131781:web:d537e085f28e247db7eb2c",
  measurementId: "G-4G4QM7Q78T"
};

const app = initializeApp(firebaseConfig);

// ✅ Export Firebase Auth
export const auth = getAuth(app);

// ✅ Export Google Provider
export const provider = new GoogleAuthProvider();
