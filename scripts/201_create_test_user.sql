-- Insert a test TU user profile
-- Note: You need to create the auth user first in Supabase Auth, then run this
-- This is just an example - replace with actual user_id from auth.users

-- First, let's create a function to handle profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, name, email, role)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'name', 'User'), NEW.email, 'TU');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create profile when user signs up
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insert some sample services
INSERT INTO public.services (name, description) VALUES
('Surat Masuk', 'Pengelolaan surat masuk'),
('Surat Keluar', 'Pengelolaan surat keluar'),
('Arsip Dokumen', 'Pengarsipan dokumen'),
('Disposisi', 'Proses disposisi surat')
ON CONFLICT DO NOTHING;
