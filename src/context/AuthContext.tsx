import {
    IS_SUPABASE_CONFIGURED,
    supabase,
    type EmergencyContact,
    type Profile,
} from "@/lib/supabase";
import type { Session, User } from "@supabase/supabase-js";
import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useState,
    type ReactNode,
} from "react";

type LocalAuthAccount = {
  id: string;
  email: string;
  password: string;
  fullName: string;
  profile: Profile;
};

type LocalAuthState = {
  accounts: LocalAuthAccount[];
  currentUserId: string | null;
};

const LOCAL_AUTH_STORAGE_KEY = "safetrail_local_auth";

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

function createProfile(id: string, fullName: string): Profile {
  const now = new Date().toISOString();
  return {
    ...EMPTY_PROFILE,
    id,
    full_name: fullName,
    created_at: now,
    updated_at: now,
  };
}

function createLocalSessionUser(account: LocalAuthAccount): User {
  return {
    id: account.id,
    app_metadata: {},
    user_metadata: { full_name: account.fullName },
    aud: "authenticated",
    created_at: account.profile.created_at,
  } as User;
}

function loadLocalAuthState(): LocalAuthState {
  if (typeof window === "undefined") {
    return { accounts: [], currentUserId: null };
  }

  try {
    const raw = window.localStorage.getItem(LOCAL_AUTH_STORAGE_KEY);
    if (!raw) return { accounts: [], currentUserId: null };
    return JSON.parse(raw) as LocalAuthState;
  } catch {
    return { accounts: [], currentUserId: null };
  }
}

function saveLocalAuthState(state: LocalAuthState) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(LOCAL_AUTH_STORAGE_KEY, JSON.stringify(state));
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const localMode = !IS_SUPABASE_CONFIGURED;

  const loadProfile = useCallback(async (uid: string) => {
    if (localMode) {
      const state = loadLocalAuthState();
      const account = state.accounts.find((entry) => entry.id === uid);
      if (account) {
        setProfile(account.profile);
        return;
      }
      setProfile(null);
      return;
    }

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", uid)
      .maybeSingle();
    if (error) {
      console.error("profile load error", error.message);
      return;
    }
    if (data) {
      setProfile(data as Profile);
    } else {
      // Create a profile on first login
      const { data: created } = await supabase
        .from("profiles")
        .insert({ id: uid })
        .select("*")
        .maybeSingle();
      if (created) setProfile(created as Profile);
      else setProfile({ ...EMPTY_PROFILE, id: uid });
    }
  }, []);

  useEffect(() => {
    if (localMode) {
      const state = loadLocalAuthState();
      const activeAccount = state.accounts.find(
        (account) => account.id === state.currentUserId,
      );
      if (activeAccount) {
        const localUser = createLocalSessionUser(activeAccount);
        setSession({ user: localUser } as Session);
        setUser(localUser);
        setProfile(activeAccount.profile);
      } else {
        setSession(null);
        setUser(null);
        setProfile(null);
      }
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setUser(data.session?.user ?? null);
      if (data.session?.user) {
        loadProfile(data.session.user.id).finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, sess) => {
      setSession(sess);
      setUser(sess?.user ?? null);
      if (sess?.user) {
        (async () => {
          await loadProfile(sess.user.id);
          setLoading(false);
        })();
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => sub.subscription.unsubscribe();
  }, [loadProfile]);

  const signInWithEmail = useCallback(
    async (email: string, password: string) => {
      if (localMode) {
        const state = loadLocalAuthState();
        const account = state.accounts.find(
          (entry) => entry.email.toLowerCase() === email.toLowerCase(),
        );
        if (!account || account.password !== password) {
          return { error: "Invalid email or password" };
        }
        state.currentUserId = account.id;
        saveLocalAuthState(state);
        const localUser = createLocalSessionUser(account);
        setSession({ user: localUser } as Session);
        setUser(localUser);
        setProfile(account.profile);
        return { error: null };
      }

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      return { error: error?.message ?? null };
    },
    [],
  );

  const signUpWithEmail = useCallback(
    async (email: string, password: string, fullName: string) => {
      if (localMode) {
        const state = loadLocalAuthState();
        const existing = state.accounts.find(
          (entry) => entry.email.toLowerCase() === email.toLowerCase(),
        );
        if (existing) {
          return { error: "An account with this email already exists" };
        }

        const id = crypto.randomUUID();
        const profile = createProfile(id, fullName);
        const account: LocalAuthAccount = {
          id,
          email,
          password,
          fullName,
          profile,
        };
        state.accounts.push(account);
        state.currentUserId = id;
        saveLocalAuthState(state);

        const localUser = createLocalSessionUser(account);
        setSession({ user: localUser } as Session);
        setUser(localUser);
        setProfile(profile);
        return { error: null };
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName } },
      });
      if (error) return { error: error.message };
      if (data.user) {
        await supabase.from("profiles").upsert({
          id: data.user.id,
          full_name: fullName,
        });
      }
      return { error: null };
    },
    [],
  );

  const signInWithGoogle = useCallback(async () => {
    if (localMode) {
      return { error: "Google sign-in requires Supabase configuration" };
    }

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin },
    });
    return { error: error?.message ?? null };
  }, []);

  const signOut = useCallback(async () => {
    if (localMode) {
      const state = loadLocalAuthState();
      state.currentUserId = null;
      saveLocalAuthState(state);
      setSession(null);
      setUser(null);
      setProfile(null);
      return;
    }

    await supabase.auth.signOut();
    setProfile(null);
  }, []);

  const refreshProfile = useCallback(async () => {
    if (user) await loadProfile(user.id);
  }, [user, loadProfile]);

  const updateProfile = useCallback(
    async (patch: Partial<Profile>) => {
      if (!user) return { error: "Not signed in" };

      if (localMode) {
        const state = loadLocalAuthState();
        const account = state.accounts.find((entry) => entry.id === user.id);
        if (!account) return { error: "Not signed in" };
        account.profile = {
          ...account.profile,
          ...patch,
          updated_at: new Date().toISOString(),
        };
        if (typeof patch.full_name === "string") {
          account.fullName = patch.full_name;
        }
        saveLocalAuthState(state);
        setProfile(account.profile);
        return { error: null };
      }

      const { error } = await supabase
        .from("profiles")
        .update({ ...patch, updated_at: new Date().toISOString() })
        .eq("id", user.id);
      if (error) return { error: error.message };
      await loadProfile(user.id);
      return { error: null };
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

