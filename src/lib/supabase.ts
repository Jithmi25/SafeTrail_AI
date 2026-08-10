import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as
  | string
  | undefined;

const missingConfigMessage =
  "Missing Supabase env vars. Check .env for VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.";

export const SUPABASE_MISSING_MESSAGE = missingConfigMessage;
export const IS_SUPABASE_CONFIGURED = Boolean(supabaseUrl && supabaseAnonKey);

function createMissingSupabaseClient() {
  const query = {
    select() {
      return query;
    },
    eq() {
      return query;
    },
    order() {
      return query;
    },
    limit() {
      return query;
    },
    maybeSingle: async () => ({ data: null, error: { message: missingConfigMessage } }),
    insert: async () => ({ data: null, error: { message: missingConfigMessage } }),
    upsert: async () => ({ data: null, error: { message: missingConfigMessage } }),
    update: async () => ({ data: null, error: { message: missingConfigMessage } }),
  };

  return {
    auth: {
      getSession: async () => ({ data: { session: null }, error: null }),
      onAuthStateChange: () => ({
        data: {
          subscription: {
            unsubscribe() {},
          },
        },
      }),
      signInWithPassword: async () => ({
        data: null,
        error: { message: missingConfigMessage },
      }),
      signUp: async () => ({
        data: null,
        error: { message: missingConfigMessage },
      }),
      signInWithOAuth: async () => ({
        data: null,
        error: { message: missingConfigMessage },
      }),
      signOut: async () => ({ error: null }),
    },
    from() {
      return query;
    },
  };
}

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(missingConfigMessage);
}

export const supabase =
  IS_SUPABASE_CONFIGURED
    ? createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
        },
      })
    : (createMissingSupabaseClient() as ReturnType<typeof createClient>);

export type EmergencyContact = {
  id: string;
  name: string;
  phone: string;
  relationship: string;
};

export type Profile = {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  country_of_origin: string | null;
  language_preference: string;
  emergency_contacts: EmergencyContact[];
  dietary_restrictions: string[];
  allergies: string[];
  created_at: string;
  updated_at: string;
};

export type SafetyReport = {
  id: string;
  user_id: string;
  category:
    | "unsafe_area"
    | "scam"
    | "bad_lighting"
    | "suspicious_activity"
    | "safe_area";
  description: string | null;
  lat: number;
  lng: number;
  location_label: string | null;
  severity: "safe" | "low" | "moderate" | "high" | "critical";
  upvotes: number;
  created_at: string;
};

export type SosIncident = {
  id: string;
  user_id: string;
  status: "triggered" | "acknowledged" | "resolved" | "cancelled";
  lat: number | null;
  lng: number | null;
  location_label: string | null;
  contacts_notified: number;
  notes: string | null;
  created_at: string;
  resolved_at: string | null;
};

export type ChatMessage = {
  id: string;
  user_id: string;
  role: "user" | "assistant";
  content: string;
  context: string;
  created_at: string;
};
