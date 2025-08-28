-- Create task assignments table
CREATE TABLE IF NOT EXISTS public.task_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID NOT NULL REFERENCES public.reports(id) ON DELETE CASCADE,
  staff_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  coordinator_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  todo_list JSONB DEFAULT '[]'::jsonb,
  completed_tasks JSONB DEFAULT '[]'::jsonb,
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in-progress', 'completed', 'revision-required')),
  notes TEXT,
  revision_notes TEXT,
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.task_assignments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for task assignments
CREATE POLICY "assignments_select_involved" ON public.task_assignments FOR SELECT USING (
  auth.uid() = staff_id OR 
  auth.uid() = coordinator_id OR
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('Admin', 'TU'))
);

CREATE POLICY "assignments_insert_coordinator" ON public.task_assignments FOR INSERT WITH CHECK (
  auth.uid() = coordinator_id OR
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('Admin', 'Koordinator'))
);

CREATE POLICY "assignments_update_involved" ON public.task_assignments FOR UPDATE USING (
  auth.uid() = staff_id OR 
  auth.uid() = coordinator_id OR
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('Admin', 'TU'))
);

CREATE POLICY "assignments_delete_coordinator" ON public.task_assignments FOR DELETE USING (
  auth.uid() = coordinator_id OR
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('Admin', 'Koordinator'))
);
