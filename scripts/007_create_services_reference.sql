-- Create services reference table
CREATE TABLE IF NOT EXISTS public.services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  required_documents JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

-- Public read access for services
CREATE POLICY "services_select_public" ON public.services FOR SELECT TO anon, authenticated USING (is_active = true);

CREATE POLICY "services_manage_admin" ON public.services FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'Admin')
);

-- Insert default services
INSERT INTO public.services (name) VALUES
('Layanan Perpanjangan Hubungan Kerja PPPK'),
('Layanan Kenaikan Pangkat'),
('Layanan Pensiun'),
('Layanan Mutasi'),
('Layanan Cuti'),
('Layanan Tunjangan'),
('Layanan Administrasi Kepegawaian'),
('Layanan Pelatihan dan Pengembangan'),
('Layanan Kesehatan'),
('Layanan Lainnya'),
('Layanan Kenaikan Gaji Berkala'),
('Layanan Pemberhentian'),
('Layanan Rehabilitasi'),
('Layanan Izin Belajar/Tugas Belajar'),
('Layanan Pindah Instansi'),
('Layanan Pemindahan Dalam Jabatan'),
('Layanan Pengangkatan Dalam Jabatan'),
('Layanan Pembebasan Dari Jabatan'),
('Layanan Pelantikan'),
('Layanan Sumpah/Janji PNS'),
('Layanan Kartu Pegawai'),
('Layanan Taspen'),
('Layanan BPJS'),
('Layanan Karpeg'),
('Layanan Karis/Karsu'),
('Layanan Duplikat'),
('Layanan Legalisir'),
('Layanan Verifikasi')
ON CONFLICT (name) DO NOTHING;
