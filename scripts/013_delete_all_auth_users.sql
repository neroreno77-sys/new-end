-- Script untuk menghapus semua user auth yang tidak diperlukan
-- HATI-HATI: Script ini akan menghapus SEMUA user auth kecuali yang memiliki profil

-- Langkah 1: Lihat daftar user auth yang akan dihapus
SELECT 
    au.id,
    au.email,
    au.created_at,
    CASE 
        WHEN p.id IS NOT NULL THEN 'HAS PROFILE - WILL KEEP'
        ELSE 'NO PROFILE - WILL DELETE'
    END as status
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
ORDER BY au.created_at;

-- Langkah 2: Hapus user auth yang tidak memiliki profil
-- UNCOMMENT baris di bawah ini untuk menjalankan penghapusan
/*
DELETE FROM auth.users 
WHERE id NOT IN (
    SELECT DISTINCT id 
    FROM public.profiles 
    WHERE id IS NOT NULL
);
*/

-- Langkah 3: Verifikasi hasil
-- SELECT COUNT(*) as remaining_auth_users FROM auth.users;
