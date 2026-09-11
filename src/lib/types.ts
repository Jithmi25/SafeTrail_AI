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
