-- Script untuk menghapus semua akun demo kecuali administrator
-- Menghapus dari profiles table dan auth.users

-- Tampilkan user yang akan dihapus
SELECT 'Users to be deleted:' as action;
SELECT user_id, name, role 
FROM profiles 
WHERE user_id IN ('tu1', 'coord1', 'coord2', 'staff1', 'staff2');

-- Hapus dari profiles table
DELETE FROM profiles 
WHERE user_id IN ('tu1', 'coord1', 'coord2', 'staff1', 'staff2');

-- Hapus dari auth.users berdasarkan email pattern
DELETE FROM auth.users 
WHERE email IN (
  'tu1@sitrack.gov.id',
  'coord1@sitrack.gov.id', 
  'coord2@sitrack.gov.id',
  'staff1@sitrack.gov.id',
  'staff2@sitrack.gov.id'
);

-- Verifikasi hasil
SELECT 'Remaining users after cleanup:' as action;
SELECT user_id, name, role FROM profiles ORDER BY user_id;

SELECT 'Auth users count:' as action;
SELECT COUNT(*) as total_auth_users FROM auth.users;
