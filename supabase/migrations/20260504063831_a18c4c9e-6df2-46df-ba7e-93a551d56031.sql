
CREATE TABLE public.community_meetings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  description text,
  meeting_date date NOT NULL,
  attendees_count integer NOT NULL DEFAULT 0,
  location text,
  is_published boolean NOT NULL DEFAULT true,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.community_meetings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published meetings" ON public.community_meetings
  FOR SELECT USING ((is_published = true) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can manage meetings" ON public.community_meetings
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_community_meetings_updated_at
BEFORE UPDATE ON public.community_meetings
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
