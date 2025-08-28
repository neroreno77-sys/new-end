-- Seed initial users for SITRACK system
-- This script creates both auth users and their corresponding profiles

-- Insert users into auth.users (this requires admin privileges)
-- Note: In production, users should be created through the application interface
-- This is for development/testing purposes only

-- Create profiles for the initial users
-- We'll use fixed UUIDs for consistency

-- Administrator
INSERT INTO profiles (id, name, role, created_at, updated_at) 
VALUES (
  '11111111-1111-1111-1111-111111111111',
  'Administrator',
  'Admin',
  NOW(),
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  role = EXCLUDED.role,
  updated_at = NOW();

-- TU Staff
INSERT INTO profiles (id, name, role, created_at, updated_at) 
VALUES (
  '22222222-2222-2222-2222-222222222222',
  'TU Staff',
  'TU',
  NOW(),
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  role = EXCLUDED.role,
  updated_at = NOW();

-- Suwarti, S.H (Koordinator 1)
INSERT INTO profiles (id, name, role, created_at, updated_at) 
VALUES (
  '33333333-3333-3333-3333-333333333333',
  'Suwarti, S.H',
  'Koordinator',
  NOW(),
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  role = EXCLUDED.role,
  updated_at = NOW();

-- Achamd Evianto (Koordinator 2)
INSERT INTO profiles (id, name, role, created_at, updated_at) 
VALUES (
  '44444444-4444-4444-4444-444444444444',
  'Achamd Evianto',
  'Koordinator',
  NOW(),
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  role = EXCLUDED.role,
  updated_at = NOW();

-- Budi Santoso (Staff 1)
INSERT INTO profiles (id, name, role, created_at, updated_at) 
VALUES (
  '55555555-5555-5555-5555-555555555555',
  'Budi Santoso',
  'Staff',
  NOW(),
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  role = EXCLUDED.role,
  updated_at = NOW();

-- Sari Dewi (Staff 2)
INSERT INTO profiles (id, name, role, created_at, updated_at) 
VALUES (
  '66666666-6666-6666-6666-666666666666',
  'Sari Dewi',
  'Staff',
  NOW(),
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  role = EXCLUDED.role,
  updated_at = NOW();

-- Create a mapping table for user IDs to login credentials (for demo purposes)
-- This helps the application know which profile corresponds to which login ID
CREATE TABLE IF NOT EXISTS user_credentials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES profiles(id),
  login_id TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert credential mappings
INSERT INTO user_credentials (profile_id, login_id, password_hash) VALUES
  ('11111111-1111-1111-1111-111111111111', 'admin1', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'), -- password: admin123
  ('22222222-2222-2222-2222-222222222222', 'tu1', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'), -- password: tu123
  ('33333333-3333-3333-3333-333333333333', 'coord1', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'), -- password: coord123
  ('44444444-4444-4444-4444-444444444444', 'coord2', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'), -- password: coord123
  ('55555555-5555-5555-5555-555555555555', 'staff1', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'), -- password: staff123
  ('66666666-6666-6666-6666-666666666666', 'staff2', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi') -- password: staff123
ON CONFLICT (login_id) DO NOTHING;

-- Enable RLS on user_credentials table
ALTER TABLE user_credentials ENABLE ROW LEVEL SECURITY;

-- Create policy for user_credentials
CREATE POLICY "Users can view their own credentials" ON user_credentials
  FOR SELECT USING (auth.uid() = profile_id);

-- Grant necessary permissions
GRANT SELECT ON user_credentials TO authenticated;
GRANT SELECT ON user_credentials TO anon;
