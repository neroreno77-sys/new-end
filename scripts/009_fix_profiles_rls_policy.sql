-- Fix infinite recursion in profiles RLS policy
-- Drop the problematic policy
DROP POLICY IF EXISTS "profiles_admin_select_all" ON public.profiles;

-- Create a function to check admin role without causing recursion
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if the current user has admin role in their JWT claims
  RETURN (auth.jwt() ->> 'user_role') = 'Admin' OR 
         (auth.jwt() -> 'user_metadata' ->> 'role') = 'Admin';
END;
$$;

-- Create new admin policy using the function
CREATE POLICY "profiles_admin_select_all" ON public.profiles FOR SELECT USING (
  public.is_admin()
);

-- Allow admins to insert, update, and delete any profile
CREATE POLICY "profiles_admin_insert_all" ON public.profiles FOR INSERT WITH CHECK (
  public.is_admin()
);

CREATE POLICY "profiles_admin_update_all" ON public.profiles FOR UPDATE USING (
  public.is_admin()
);

CREATE POLICY "profiles_admin_delete_all" ON public.profiles FOR DELETE USING (
  public.is_admin()
);

-- Update the handle_new_user function to set role in user metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'name', 'User'),
    COALESCE(NEW.raw_user_meta_data ->> 'role', 'Staff')
  )
  ON CONFLICT (id) DO NOTHING;
  
  -- Also update the user metadata to include role for JWT
  UPDATE auth.users 
  SET raw_user_meta_data = COALESCE(raw_user_meta_data, '{}'::jsonb) || 
      jsonb_build_object('role', COALESCE(NEW.raw_user_meta_data ->> 'role', 'Staff'))
  WHERE id = NEW.id;
  
  RETURN NEW;
END;
$$;
