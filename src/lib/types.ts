export type EmergencyContact = {
  id: string;
  name: string;
  phone: string;
  relationship: string;
};

export type Profile = {
  id: string;
  fullName: string | null;
  avatarUrl: string | null;
  countryOfOrigin: string | null;
  languagePreference: string;
  emergencyContacts: EmergencyContact[];
  dietaryRestrictions: string[];
  allergies: string[];
  createdAt: string;
  updatedAt: string;
};

export type SafetyReport = {
  id: string;
  userId: string;
  category:
    | "unsafe_area"
    | "scam"
    | "bad_lighting"
    | "suspicious_activity"
    | "safe_area";
  description: string | null;
  latitude: number;
  longitude: number;
  locationLabel: string | null;
  severity: "safe" | "low" | "moderate" | "high" | "critical";
  upvotes: number;
  createdAt: string;
};

export type SosIncident = {
  id: string;
  userId: string;
  status: "triggered" | "acknowledged" | "resolved" | "cancelled";
  latitude: number | null;
  longitude: number | null;
  locationLabel: string | null;
  contactsNotified: number;
  notes: string | null;
  createdAt: string;
  resolvedAt: string | null;
};

export type ChatMessage = {
  id: string;
  userId: string;
  role: "user" | "assistant";
  content: string;
  context: string;
  createdAt: string;
};
