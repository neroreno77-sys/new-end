-- Script to delete demo accounts from both profiles and auth
-- This will remove all the initial demo accounts that were created

-- First, let's see what demo accounts currently exist
SELECT 
    id,
    user_id,
    name,
    role,
    created_at
FROM profiles 
WHERE user_id IN ('admin1', 'tu1', 'coord1', 'coord2', 'staff1', 'staff2')
ORDER BY created_at;

-- Delete demo accounts from profiles table
DELETE FROM profiles 
WHERE user_id IN ('admin1', 'tu1', 'coord1', 'coord2', 'staff1', 'staff2');

-- Delete corresponding auth users
-- Note: This will delete auth users whose email matches the demo account pattern
DELETE FROM auth.users 
WHERE email IN (
    'admin1@sitrack.gov.id',
    'tu1@sitrack.gov.id', 
    'coord1@sitrack.gov.id',
    'coord2@sitrack.gov.id',
    'staff1@sitrack.gov.id',
    'staff2@sitrack.gov.id'
);

-- Verify deletion - should return no rows
SELECT 
    id,
    user_id,
    name,
    role
FROM profiles 
WHERE user_id IN ('admin1', 'tu1', 'coord1', 'coord2', 'staff1', 'staff2');

-- Check remaining auth users count
SELECT COUNT(*) as remaining_auth_users FROM auth.users;

-- Show remaining profiles
SELECT 
    user_id,
    name,
    role,
    created_at
FROM profiles 
ORDER BY created_at DESC;
