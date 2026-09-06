import { getApp, getApps, initializeApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const requiredConfig = Object.values(firebaseConfig);
export const IS_FIREBASE_CONFIGURED = requiredConfig.every(Boolean);

export const FIREBASE_MISSING_MESSAGE =
  "Missing Firebase env vars. Check .env for VITE_FIREBASE_* values.";

export const firebaseApp: FirebaseApp | null = IS_FIREBASE_CONFIGURED
  ? getApps().length > 0
    ? getApp()
    : initializeApp(firebaseConfig)
  : null;

export const firebaseAuth: Auth | null = firebaseApp
  ? getAuth(firebaseApp)
  : null;
export const firestore: Firestore | null = firebaseApp
  ? getFirestore(firebaseApp)
  : null;

if (!IS_FIREBASE_CONFIGURED) {
  console.warn(FIREBASE_MISSING_MESSAGE);
}
