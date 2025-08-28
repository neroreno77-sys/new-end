-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT,
    role TEXT NOT NULL CHECK (role IN ('Admin', 'TU', 'Koordinator', 'Staff')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create reports table
CREATE TABLE IF NOT EXISTS public.reports (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    no_surat TEXT,
    hal TEXT,
    layanan TEXT,
    dari TEXT,
    tanggal_surat DATE,
    tanggal_agenda DATE,
    no_agenda TEXT,
    kelompok_asal_surat TEXT,
    agenda_sestama TEXT,
    sifat TEXT CHECK (sifat IN ('Biasa', 'Segera', 'Sangat Segera')),
    derajat TEXT CHECK (derajat IN ('Biasa', 'Terbatas', 'Rahasia', 'Sangat Rahasia')),
    status TEXT DEFAULT 'Dalam Proses' CHECK (status IN ('Dalam Proses', 'Selesai', 'Ditolak', 'Pending')),
    priority TEXT DEFAULT 'Normal' CHECK (priority IN ('Low', 'Normal', 'High', 'Urgent')),
    tracking_number TEXT UNIQUE,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create file_attachments table
CREATE TABLE IF NOT EXISTS public.file_attachments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    report_id UUID REFERENCES public.reports(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    file_url TEXT NOT NULL,
    file_type TEXT,
    uploaded_by UUID REFERENCES auth.users(id),
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create letter_tracking table
CREATE TABLE IF NOT EXISTS public.letter_tracking (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    report_id UUID REFERENCES public.reports(id) ON DELETE CASCADE,
    tracking_number TEXT NOT NULL,
    current_status TEXT DEFAULT 'Diterima',
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create workflow_history table
CREATE TABLE IF NOT EXISTS public.workflow_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    report_id UUID REFERENCES public.reports(id) ON DELETE CASCADE,
    action TEXT NOT NULL,
    performed_by UUID REFERENCES auth.users(id),
    status TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create services table
CREATE TABLE IF NOT EXISTS public.services (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create task_assignments table
CREATE TABLE IF NOT EXISTS public.task_assignments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    report_id UUID REFERENCES public.reports(id) ON DELETE CASCADE,
    assigned_to UUID REFERENCES auth.users(id),
    assigned_by UUID REFERENCES auth.users(id),
    task_description TEXT,
    status TEXT DEFAULT 'Pending' CHECK (status IN ('Pending', 'In Progress', 'Completed', 'Cancelled')),
    due_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.file_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.letter_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_assignments ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view reports" ON public.reports
    FOR SELECT USING (true);

CREATE POLICY "TU and Admin can create reports" ON public.reports
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE user_id = auth.uid() 
            AND role IN ('TU', 'Admin')
        )
    );

CREATE POLICY "Anyone can view file attachments" ON public.file_attachments
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can upload files" ON public.file_attachments
    FOR INSERT WITH CHECK (auth.uid() = uploaded_by);

CREATE POLICY "Anyone can view letter tracking" ON public.letter_tracking
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create tracking" ON public.letter_tracking
    FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Anyone can view workflow history" ON public.workflow_history
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create workflow history" ON public.workflow_history
    FOR INSERT WITH CHECK (auth.uid() = performed_by);

CREATE POLICY "Anyone can view services" ON public.services
    FOR SELECT USING (true);

CREATE POLICY "Anyone can view task assignments" ON public.task_assignments
    FOR SELECT USING (true);

CREATE POLICY "Authorized users can create task assignments" ON public.task_assignments
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE user_id = auth.uid() 
            AND role IN ('Admin', 'Koordinator')
        )
    );
