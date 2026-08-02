/*
# SafeTrail AI — Core Database Schema

## Purpose
Stores user profile data, community safety reports, SOS emergency incidents,
and AI companion chat history for the SafeTrail AI tourism safety app.

## Tables Created
1. `profiles` — Extends auth.users with traveler-specific info: country of origin,
   language preferences, emergency contacts, and dietary/allergen settings.
2. `safety_reports` — Community-submitted incident pins on the safety map
   (category: unsafe area, scam, bad lighting, suspicious activity).
3. `sos_incidents` — Records of triggered SOS events with status, GPS, and timestamps.
4. `chat_messages` — AI companion ("Walk With Me") conversation history.

## Security (RLS)
- All tables enable Row Level Security.
- `profiles`: owner-scoped (auth.uid() = id).
- `safety_reports`: any authenticated user can read all community reports
  (shared safety data), but only owners can modify their own.
- `sos_incidents`: owner-scoped.
- `chat_messages`: owner-scoped.
- Owner columns default to auth.uid() so inserts succeed even when the client
  omits the user_id.

## Notes
- This is a multi-user app with a sign-in screen, so all policies use `TO authenticated`.
- Uses `gen_random_uuid()` for primary keys.
- Timestamps default to now().
*/

-- ===== profiles =====
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  avatar_url text,
  country_of_origin text,
  language_preference text DEFAULT 'en',
  emergency_contacts jsonb DEFAULT '[]'::jsonb,
  dietary_restrictions jsonb DEFAULT '[]'::jsonb,
  allergies jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_profile" ON profiles;
CREATE POLICY "select_own_profile"
  ON profiles FOR SELECT TO authenticated
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "insert_own_profile" ON profiles;
CREATE POLICY "insert_own_profile"
  ON profiles FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "update_own_profile" ON profiles;
CREATE POLICY "update_own_profile"
  ON profiles FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "delete_own_profile" ON profiles;
CREATE POLICY "delete_own_profile"
  ON profiles FOR DELETE TO authenticated
  USING (auth.uid() = id);

-- ===== safety_reports =====
CREATE TABLE IF NOT EXISTS safety_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  category text NOT NULL CHECK (category IN ('unsafe_area','scam','bad_lighting','suspicious_activity','safe_area')),
  description text,
  lat double precision NOT NULL,
  lng double precision NOT NULL,
  location_label text,
  severity text NOT NULL DEFAULT 'moderate' CHECK (severity IN ('safe','low','moderate','high','critical')),
  upvotes int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE safety_reports ENABLE ROW LEVEL SECURITY;

-- Community reports are readable by all authenticated users (shared safety data)
DROP POLICY IF EXISTS "read_all_safety_reports" ON safety_reports;
CREATE POLICY "read_all_safety_reports"
  ON safety_reports FOR SELECT TO authenticated
  USING (true);

DROP POLICY IF EXISTS "insert_own_safety_reports" ON safety_reports;
CREATE POLICY "insert_own_safety_reports"
  ON safety_reports FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_safety_reports" ON safety_reports;
CREATE POLICY "update_own_safety_reports"
  ON safety_reports FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_safety_reports" ON safety_reports;
CREATE POLICY "delete_own_safety_reports"
  ON safety_reports FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- ===== sos_incidents =====
CREATE TABLE IF NOT EXISTS sos_incidents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'triggered' CHECK (status IN ('triggered','acknowledged','resolved','cancelled')),
  lat double precision,
  lng double precision,
  location_label text,
  contacts_notified int DEFAULT 0,
  notes text,
  created_at timestamptz DEFAULT now(),
  resolved_at timestamptz
);

ALTER TABLE sos_incidents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_sos" ON sos_incidents;
CREATE POLICY "select_own_sos"
  ON sos_incidents FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_sos" ON sos_incidents;
CREATE POLICY "insert_own_sos"
  ON sos_incidents FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_sos" ON sos_incidents;
CREATE POLICY "update_own_sos"
  ON sos_incidents FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_sos" ON sos_incidents;
CREATE POLICY "delete_own_sos"
  ON sos_incidents FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- ===== chat_messages =====
CREATE TABLE IF NOT EXISTS chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('user','assistant')),
  content text NOT NULL,
  context text DEFAULT 'companion',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_chat" ON chat_messages;
CREATE POLICY "select_own_chat"
  ON chat_messages FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_chat" ON chat_messages;
CREATE POLICY "insert_own_chat"
  ON chat_messages FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_chat" ON chat_messages;
CREATE POLICY "update_own_chat"
  ON chat_messages FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_chat" ON chat_messages;
CREATE POLICY "delete_own_chat"
  ON chat_messages FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- Helpful indexes
CREATE INDEX IF NOT EXISTS idx_safety_reports_location ON safety_reports (lat, lng);
CREATE INDEX IF NOT EXISTS idx_sos_incidents_user ON sos_incidents (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_messages_user ON chat_messages (user_id, created_at ASC);
