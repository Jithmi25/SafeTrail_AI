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
