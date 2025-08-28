-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Add updated_at triggers to relevant tables
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_reports_updated_at ON public.reports;
CREATE TRIGGER update_reports_updated_at
  BEFORE UPDATE ON public.reports
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_assignments_updated_at ON public.task_assignments;
CREATE TRIGGER update_assignments_updated_at
  BEFORE UPDATE ON public.task_assignments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_tracking_updated_at ON public.letter_tracking;
CREATE TRIGGER update_tracking_updated_at
  BEFORE UPDATE ON public.letter_tracking
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function to update report progress based on assignments
CREATE OR REPLACE FUNCTION public.update_report_progress()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.reports 
  SET progress = (
    SELECT COALESCE(AVG(progress), 0)
    FROM public.task_assignments 
    WHERE report_id = NEW.report_id
  )
  WHERE id = NEW.report_id;
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS update_report_progress_trigger ON public.task_assignments;
CREATE TRIGGER update_report_progress_trigger
  AFTER UPDATE OF progress ON public.task_assignments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_report_progress();
