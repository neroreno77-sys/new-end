-- Script to delete specific demo accounts while keeping admin
-- This will remove: tu1, coord1, coord2, staff1, staff2
-- This will keep: admin1

-- First, let's see what we have
SELECT 'Current profiles:' as info;
SELECT user_id, name, role FROM profiles ORDER BY user_id;

-- Delete specific demo accounts from profiles table
DELETE FROM profiles 
WHERE user_id IN ('tu1', 'coord1', 'coord2', 'staff1', 'staff2');

-- Delete corresponding auth users
-- Note: This uses the auth.users table to find and delete users by email
DELETE FROM auth.users 
WHERE email IN (
  'tu1@sitrack.gov.id',
  'coord1@sitrack.gov.id', 
  'coord2@sitrack.gov.id',
  'staff1@sitrack.gov.id',
  'staff2@sitrack.gov.id'
);

-- Verify the cleanup
SELECT 'Remaining profiles after cleanup:' as info;
SELECT user_id, name, role FROM profiles ORDER BY user_id;

SELECT 'Remaining auth users after cleanup:' as info;
SELECT email, created_at FROM auth.users ORDER BY created_at;
