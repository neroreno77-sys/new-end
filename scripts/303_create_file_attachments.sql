-- Create file attachments table
CREATE TABLE IF NOT EXISTS public.file_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID NOT NULL REFERENCES public.reports(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT DEFAULT 'original' CHECK (file_type IN ('original', 'response', 'revision')),
  file_size BIGINT,
  uploaded_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.file_attachments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for file attachments
CREATE POLICY "attachments_select_report_access" ON public.file_attachments FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.reports r 
    WHERE r.id = report_id AND (
      auth.uid() = r.created_by OR 
      auth.uid() = r.current_holder OR
      EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('Admin', 'Koordinator', 'TU'))
    )
  )
);

CREATE POLICY "attachments_insert_authorized" ON public.file_attachments FOR INSERT WITH CHECK (
  auth.uid() = uploaded_by AND
  EXISTS (
    SELECT 1 FROM public.reports r 
    WHERE r.id = report_id AND (
      auth.uid() = r.created_by OR 
      auth.uid() = r.current_holder OR
      EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('Admin', 'Koordinator', 'TU'))
    )
  )
);

CREATE POLICY "attachments_delete_uploader" ON public.file_attachments FOR DELETE USING (
  auth.uid() = uploaded_by OR
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('Admin', 'Koordinator'))
);
