import { getApp, getApps, initializeApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth, type FirebaseError } from "firebase/auth";
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

export const FIREBASE_AUTH_SETUP_MESSAGE =
  "Firebase Authentication is not enabled for this project. In Firebase Console, open Authentication > Sign-in method and enable the required provider.";

export function getFirebaseAuthErrorMessage(error: unknown) {
  const code = (error as FirebaseError | undefined)?.code;
  switch (code) {
    case "auth/configuration-not-found":
      return FIREBASE_AUTH_SETUP_MESSAGE;
    case "auth/operation-not-allowed":
      return "This sign-in method is disabled. Enable it in Firebase Console under Authentication > Sign-in method.";
    case "auth/invalid-credential":
    case "auth/wrong-password":
    case "auth/user-not-found":
      return "The email or password is incorrect.";
    case "auth/email-already-in-use":
      return "An account already exists with this email address.";
    case "auth/invalid-email":
      return "Enter a valid email address.";
    case "auth/popup-blocked":
      return "Your browser blocked the Google sign-in window. Allow popups and try again.";
    case "auth/unauthorized-domain":
      return "This website is not authorized for Firebase sign-in. Add its domain in Firebase Console under Authentication > Settings > Authorized domains.";
    default:
      return error instanceof Error ? error.message : "Unable to authenticate";
  }
}

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
} else {
  console.info(`Firebase project configured: ${firebaseConfig.projectId}`);
}
