-- Seed some initial services for the document management system
INSERT INTO public.services (name, required_documents, is_active) VALUES
('Surat Masuk', '["Surat Asli", "Fotocopy KTP"]', true),
('Surat Keluar', '["Draft Surat", "Lampiran"]', true),
('Pengaduan', '["Formulir Pengaduan", "Bukti Pendukung"]', true),
('Permohonan Informasi', '["Formulir Permohonan", "Identitas Pemohon"]', true),
('Konsultasi', '["Dokumen Terkait"]', true)
ON CONFLICT (name) DO NOTHING;
