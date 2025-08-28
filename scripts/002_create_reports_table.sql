-- Create reports table
CREATE TABLE IF NOT EXISTS public.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  no_surat TEXT NOT NULL,
  hal TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'in-progress', 'completed', 'revision-required', 'forwarded-to-tu')),
  layanan TEXT NOT NULL,
  dari TEXT NOT NULL,
  tanggal_surat DATE NOT NULL,
  tanggal_agenda DATE,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  current_holder UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  priority TEXT DEFAULT 'sedang' CHECK (priority IN ('rendah', 'sedang', 'tinggi')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- RLS Policies for reports
CREATE POLICY "reports_select_own" ON public.reports FOR SELECT USING (
  auth.uid() = created_by OR 
  auth.uid() = current_holder OR
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('Admin', 'Koordinator', 'TU'))
);

CREATE POLICY "reports_insert_own" ON public.reports FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "reports_update_authorized" ON public.reports FOR UPDATE USING (
  auth.uid() = created_by OR 
  auth.uid() = current_holder OR
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('Admin', 'Koordinator', 'TU'))
);

CREATE POLICY "reports_delete_authorized" ON public.reports FOR DELETE USING (
  auth.uid() = created_by OR
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('Admin', 'Koordinator'))
);
