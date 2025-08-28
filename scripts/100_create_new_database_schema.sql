-- Create the new database schema based on user requirements
-- This will create all tables for the document management system

-- Enable RLS on all tables
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';

-- Create services table first (no dependencies)
CREATE TABLE IF NOT EXISTS public.services (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  required_documents jsonb DEFAULT '[]'::jsonb,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT services_pkey PRIMARY KEY (id)
);

-- Create profiles table (references auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid NOT NULL,
  name text NOT NULL,
  role text NOT NULL CHECK (role = ANY (ARRAY['Admin'::text, 'TU'::text, 'Koordinator'::text, 'Staff'::text])),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  user_id text UNIQUE,
  CONSTRAINT profiles_pkey PRIMARY KEY (id),
  CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create reports table
CREATE TABLE IF NOT EXISTS public.reports (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  no_surat text NOT NULL,
  hal text NOT NULL,
  status text NOT NULL DEFAULT 'draft'::text CHECK (status = ANY (ARRAY['draft'::text, 'in-progress'::text, 'completed'::text, 'revision-required'::text, 'forwarded-to-tu'::text])),
  layanan text NOT NULL,
  dari text NOT NULL,
  tanggal_surat date NOT NULL,
  tanggal_agenda date,
  created_by uuid NOT NULL,
  current_holder uuid,
  progress integer DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  priority text DEFAULT 'sedang'::text CHECK (priority = ANY (ARRAY['rendah'::text, 'sedang'::text, 'tinggi'::text])),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT reports_pkey PRIMARY KEY (id),
  CONSTRAINT reports_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE CASCADE,
  CONSTRAINT reports_current_holder_fkey FOREIGN KEY (current_holder) REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Create file_attachments table
CREATE TABLE IF NOT EXISTS public.file_attachments (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  report_id uuid NOT NULL,
  file_name text NOT NULL,
  file_url text NOT NULL,
  file_type text DEFAULT 'original'::text CHECK (file_type = ANY (ARRAY['original'::text, 'response'::text, 'revision'::text])),
  file_size bigint,
  uploaded_by uuid NOT NULL,
  uploaded_at timestamp with time zone DEFAULT now(),
  CONSTRAINT file_attachments_pkey PRIMARY KEY (id),
  CONSTRAINT file_attachments_report_id_fkey FOREIGN KEY (report_id) REFERENCES public.reports(id) ON DELETE CASCADE,
  CONSTRAINT file_attachments_uploaded_by_fkey FOREIGN KEY (uploaded_by) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create letter_tracking table
CREATE TABLE IF NOT EXISTS public.letter_tracking (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  report_id uuid NOT NULL,
  tracking_number text NOT NULL UNIQUE,
  current_location text DEFAULT 'Diterima'::text,
  estimated_completion date,
  tracking_history jsonb DEFAULT '[]'::jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT letter_tracking_pkey PRIMARY KEY (id),
  CONSTRAINT letter_tracking_report_id_fkey FOREIGN KEY (report_id) REFERENCES public.reports(id) ON DELETE CASCADE
);

-- Create task_assignments table
CREATE TABLE IF NOT EXISTS public.task_assignments (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  report_id uuid NOT NULL,
  staff_id uuid NOT NULL,
  coordinator_id uuid NOT NULL,
  todo_list jsonb DEFAULT '[]'::jsonb,
  completed_tasks jsonb DEFAULT '[]'::jsonb,
  progress integer DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  status text DEFAULT 'pending'::text CHECK (status = ANY (ARRAY['pending'::text, 'in-progress'::text, 'completed'::text, 'revision-required'::text])),
  notes text,
  revision_notes text,
  assigned_at timestamp with time zone DEFAULT now(),
  completed_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT task_assignments_pkey PRIMARY KEY (id),
  CONSTRAINT task_assignments_report_id_fkey FOREIGN KEY (report_id) REFERENCES public.reports(id) ON DELETE CASCADE,
  CONSTRAINT task_assignments_staff_id_fkey FOREIGN KEY (staff_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  CONSTRAINT task_assignments_coordinator_id_fkey FOREIGN KEY (coordinator_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create workflow_history table
CREATE TABLE IF NOT EXISTS public.workflow_history (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  report_id uuid NOT NULL,
  action text NOT NULL,
  user_id uuid NOT NULL,
  status text NOT NULL,
  notes text,
  timestamp timestamp with time zone DEFAULT now(),
  CONSTRAINT workflow_history_pkey PRIMARY KEY (id),
  CONSTRAINT workflow_history_report_id_fkey FOREIGN KEY (report_id) REFERENCES public.reports(id) ON DELETE CASCADE,
  CONSTRAINT workflow_history_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Enable Row Level Security on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.file_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.letter_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins can manage all profiles" ON public.profiles FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'Admin'
  )
);

-- Create RLS policies for reports
CREATE POLICY "Users can view reports they created or are assigned to" ON public.reports FOR SELECT USING (
  auth.uid() = created_by OR 
  auth.uid() = current_holder OR
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role IN ('Admin', 'TU', 'Koordinator')
  )
);

CREATE POLICY "Users can create reports" ON public.reports FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Authorized users can update reports" ON public.reports FOR UPDATE USING (
  auth.uid() = created_by OR 
  auth.uid() = current_holder OR
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role IN ('Admin', 'TU', 'Koordinator')
  )
);

-- Create RLS policies for other tables (similar pattern)
CREATE POLICY "Users can view file attachments for accessible reports" ON public.file_attachments FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.reports r 
    WHERE r.id = report_id AND (
      r.created_by = auth.uid() OR 
      r.current_holder = auth.uid() OR
      EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND role IN ('Admin', 'TU', 'Koordinator')
      )
    )
  )
);

CREATE POLICY "Users can upload file attachments" ON public.file_attachments FOR INSERT WITH CHECK (auth.uid() = uploaded_by);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_reports_created_by ON public.reports(created_by);
CREATE INDEX IF NOT EXISTS idx_reports_current_holder ON public.reports(current_holder);
CREATE INDEX IF NOT EXISTS idx_reports_status ON public.reports(status);
CREATE INDEX IF NOT EXISTS idx_file_attachments_report_id ON public.file_attachments(report_id);
CREATE INDEX IF NOT EXISTS idx_letter_tracking_report_id ON public.letter_tracking(report_id);
CREATE INDEX IF NOT EXISTS idx_task_assignments_report_id ON public.task_assignments(report_id);
CREATE INDEX IF NOT EXISTS idx_task_assignments_staff_id ON public.task_assignments(staff_id);
CREATE INDEX IF NOT EXISTS idx_workflow_history_report_id ON public.workflow_history(report_id);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_reports_updated_at BEFORE UPDATE ON public.reports FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_letter_tracking_updated_at BEFORE UPDATE ON public.letter_tracking FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_task_assignments_updated_at BEFORE UPDATE ON public.task_assignments FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
