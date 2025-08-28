# Setup Lokal untuk VSCode

## Langkah-langkah Setup:

1. **Copy file environment variables:**
   \`\`\`bash
   cp .env.local.example .env.local
   \`\`\`

2. **Install dependencies:**
   \`\`\`bash
   npm install
   \`\`\`

3. **Jalankan development server:**
   \`\`\`bash
   npm run dev
   \`\`\`

## Troubleshooting:

### Error "Unauthorized" saat save report:
- Pastikan file `.env.local` sudah dibuat dan berisi environment variables yang benar
- Restart development server setelah menambah environment variables
- Pastikan Anda sudah login dengan akun yang memiliki role TU/Admin/Koordinator

### Error "No token found" untuk Blob upload:
- Pastikan `BLOB_READ_WRITE_TOKEN` sudah ada di `.env.local`
- Token sudah dikonfigurasi dengan benar di file example

### Error koneksi Supabase:
- Pastikan `NEXT_PUBLIC_SUPABASE_URL` dan `NEXT_PUBLIC_SUPABASE_ANON_KEY` sudah benar
- Cek koneksi internet Anda

## Environment Variables yang Diperlukan:

- `NEXT_PUBLIC_SUPABASE_URL`: URL database Supabase Anda
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Anon key dari Supabase
- `BLOB_READ_WRITE_TOKEN`: Token untuk upload file ke Vercel Blob
- `NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL`: URL redirect untuk development (localhost:3000)
