-- Script untuk membersihkan user auth yang tidak memiliki profil
-- HATI-HATI: Script ini akan menghapus semua user auth yang tidak ada di tabel profiles

-- Tampilkan dulu user yang akan dihapus (untuk review)
SELECT 
  au.id,
  au.email,
  au.created_at
FROM auth.users au
LEFT JOIN profiles p ON au.id = p.id
WHERE p.id IS NULL;

-- Uncomment baris di bawah untuk menjalankan penghapusan
-- DELETE FROM auth.users 
-- WHERE id IN (
--   SELECT au.id 
--   FROM auth.users au
--   LEFT JOIN profiles p ON au.id = p.id
--   WHERE p.id IS NULL
-- );
