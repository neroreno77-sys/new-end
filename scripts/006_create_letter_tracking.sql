-- Create letter tracking table
CREATE TABLE IF NOT EXISTS public.letter_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID NOT NULL REFERENCES public.reports(id) ON DELETE CASCADE,
  tracking_number TEXT UNIQUE NOT NULL,
  current_location TEXT DEFAULT 'Diterima',
  estimated_completion DATE,
  tracking_history JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.letter_tracking ENABLE ROW LEVEL SECURITY;

-- RLS Policies for letter tracking (public read access for tracking)
CREATE POLICY "tracking_select_public" ON public.letter_tracking FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "tracking_insert_authorized" ON public.letter_tracking FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('Admin', 'Koordinator', 'TU'))
);

CREATE POLICY "tracking_update_authorized" ON public.letter_tracking FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('Admin', 'Koordinator', 'TU'))
);

-- Auto-create tracking entry when report is created
CREATE OR REPLACE FUNCTION public.create_tracking_entry()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.letter_tracking (report_id, tracking_number, current_location, tracking_history)
  VALUES (
    NEW.id,
    'TRK-' || UPPER(SUBSTRING(NEW.id::text, 1, 8)),
    'Diterima',
    jsonb_build_array(
      jsonb_build_object(
        'timestamp', NOW(),
        'location', 'Diterima',
        'status', 'Laporan diterima dan sedang diproses',
        'user', 'System'
      )
    )
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS create_tracking_on_report ON public.reports;
CREATE TRIGGER create_tracking_on_report
  AFTER INSERT ON public.reports
  FOR EACH ROW
  EXECUTE FUNCTION public.create_tracking_entry();
