-- Add user_id column to profiles table to store original login IDs
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS user_id TEXT UNIQUE;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);

-- Update existing profiles with sample user_ids if they don't have them
UPDATE profiles SET user_id = 'admin1' WHERE name = 'Administrator' AND user_id IS NULL;
UPDATE profiles SET user_id = 'tu1' WHERE name = 'TU Staff' AND user_id IS NULL;
UPDATE profiles SET user_id = 'coord1' WHERE name = 'Suwarti, S.H' AND user_id IS NULL;
UPDATE profiles SET user_id = 'coord2' WHERE name = 'Achamd Evianto' AND user_id IS NULL;
UPDATE profiles SET user_id = 'staff1' WHERE name = 'Budi Santoso' AND user_id IS NULL;
UPDATE profiles SET user_id = 'staff2' WHERE name = 'Sari Dewi' AND user_id IS NULL;
