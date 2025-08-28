-- Create workflow history table
CREATE TABLE IF NOT EXISTS public.workflow_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID NOT NULL REFERENCES public.reports(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  notes TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.workflow_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies for workflow history
CREATE POLICY "history_select_report_access" ON public.workflow_history FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.reports r 
    WHERE r.id = report_id AND (
      auth.uid() = r.created_by OR 
      auth.uid() = r.current_holder OR
      EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('Admin', 'Koordinator', 'TU'))
    )
  )
);

CREATE POLICY "history_insert_authorized" ON public.workflow_history FOR INSERT WITH CHECK (
  auth.uid() = user_id AND
  EXISTS (
    SELECT 1 FROM public.reports r 
    WHERE r.id = report_id AND (
      auth.uid() = r.created_by OR 
      auth.uid() = r.current_holder OR
      EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('Admin', 'Koordinator', 'TU'))
    )
  )
);
