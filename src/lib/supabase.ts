import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    "Missing Supabase env vars. Check .env for VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.",
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

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
