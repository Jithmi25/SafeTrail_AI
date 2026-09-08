import {
  FIREBASE_MISSING_MESSAGE,
  firebaseAuth,
  firestore,
  IS_FIREBASE_CONFIGURED,
} from "@/lib/firebase";
import type { EmergencyContact, Profile } from "@/lib/types";
import {
  browserLocalPersistence,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  GoogleAuthProvider,
  onAuthStateChanged,
  setPersistence,
  signInWithEmailAndPassword,
  signInWithPopup,
  updateProfile as updateFirebaseProfile,
  type User,
} from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

type Session = { user: User };

type AuthContextValue = {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signInWithEmail: (
    email: string,
    password: string,
  ) => Promise<{ error: string | null }>;
  signUpWithEmail: (
    email: string,
    password: string,
    fullName: string,
  ) => Promise<{ error: string | null }>;
  signInWithGoogle: () => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  updateProfile: (patch: Partial<Profile>) => Promise<{ error: string | null }>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const EMPTY_PROFILE: Profile = {
  id: "",
  full_name: null,
  avatar_url: null,
  country_of_origin: null,
  language_preference: "en",
  emergency_contacts: [],
  dietary_restrictions: [],
  allergies: [],
  created_at: "",
  updated_at: "",
};

function createProfile(id: string, fullName: string | null): Profile {
  const now = new Date().toISOString();
  return {
    ...EMPTY_PROFILE,
    id,
    full_name: fullName,
    created_at: now,
    updated_at: now,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const loadProfile = useCallback(
    async (uid: string, fullName: string | null = null) => {
      if (!firestore) {
        setProfile(null);
        return;
      }

      const profileRef = doc(firestore, "profiles", uid);
      const snapshot = await getDoc(profileRef);
      if (snapshot.exists()) {
        setProfile(snapshot.data() as Profile);
      } else {
        const newProfile = createProfile(uid, fullName);
        await setDoc(profileRef, newProfile);
        setProfile(newProfile);
      }
    },
    [],
  );

  useEffect(() => {
    if (!firebaseAuth || !IS_FIREBASE_CONFIGURED) {
      setLoading(false);
      return;
    }

    const auth = firebaseAuth;
    let unsubscribe = () => {};
    setPersistence(auth, browserLocalPersistence)
      .then(() => {
        unsubscribe = onAuthStateChanged(auth, (nextUser) => {
          setUser(nextUser);
          setSession(nextUser ? { user: nextUser } : null);
          if (nextUser) {
            loadProfile(nextUser.uid, nextUser.displayName).finally(() =>
              setLoading(false),
            );
          } else {
            setProfile(null);
            setLoading(false);
          }
        });
      })
      .catch((error: Error) => {
        console.error("Firebase persistence setup failed", error.message);
        setLoading(false);
      });

    return () => {
      unsubscribe();
    };
  }, [loadProfile]);

  const signInWithEmail = useCallback(
    async (email: string, password: string) => {
      if (!firebaseAuth) return { error: FIREBASE_MISSING_MESSAGE };
      try {
        await signInWithEmailAndPassword(firebaseAuth, email, password);
        return { error: null };
      } catch (error) {
        return {
          error: error instanceof Error ? error.message : "Unable to sign in",
        };
      }
    },
    [],
  );

  const signUpWithEmail = useCallback(
    async (email: string, password: string, fullName: string) => {
      if (!firebaseAuth || !firestore)
        return { error: FIREBASE_MISSING_MESSAGE };
      try {
        const credential = await createUserWithEmailAndPassword(
          firebaseAuth,
          email,
          password,
        );
        await updateFirebaseProfile(credential.user, { displayName: fullName });
        const profile = createProfile(credential.user.uid, fullName);
        await setDoc(doc(firestore, "profiles", credential.user.uid), profile);
        setProfile(profile);
        return { error: null };
      } catch (error) {
        return {
          error:
            error instanceof Error ? error.message : "Unable to create account",
        };
      }
    },
    [],
  );

  const signInWithGoogle = useCallback(async () => {
    if (!firebaseAuth) return { error: FIREBASE_MISSING_MESSAGE };
    try {
      await signInWithPopup(firebaseAuth, new GoogleAuthProvider());
      return { error: null };
    } catch (error) {
      return {
        error:
          error instanceof Error
            ? error.message
            : "Unable to sign in with Google",
      };
    }
  }, []);

  const signOut = useCallback(async () => {
    if (firebaseAuth) await firebaseSignOut(firebaseAuth);
  }, []);

  const refreshProfile = useCallback(async () => {
    if (user) await loadProfile(user.uid, user.displayName);
  }, [user, loadProfile]);

  const updateProfile = useCallback(
    async (patch: Partial<Profile>) => {
      if (!user) return { error: "Not signed in" };

      if (!firestore) return { error: FIREBASE_MISSING_MESSAGE };
      try {
        const update = { ...patch, updated_at: new Date().toISOString() };
        await updateDoc(doc(firestore, "profiles", user.uid), update);
        if (patch.full_name !== undefined) {
          await updateFirebaseProfile(user, {
            displayName: patch.full_name ?? "",
          });
        }
        await loadProfile(user.uid, user.displayName);
        return { error: null };
      } catch (error) {
        return {
          error:
            error instanceof Error ? error.message : "Unable to update profile",
        };
      }
    },
    [user, loadProfile],
  );

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        profile,
        loading,
        signInWithEmail,
        signUpWithEmail,
        signInWithGoogle,
        signOut,
        refreshProfile,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export type { EmergencyContact };
