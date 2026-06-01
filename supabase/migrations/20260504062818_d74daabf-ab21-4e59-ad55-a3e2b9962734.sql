CREATE TABLE public.community_applications (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  business_name text,
  business_type text,
  interests text,
  message text,
  status text NOT NULL DEFAULT 'pending',
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.community_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit community applications"
  ON public.community_applications FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can manage community applications"
  ON public.community_applications FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Only admins can view community applications"
  ON public.community_applications FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_community_applications_updated_at
  BEFORE UPDATE ON public.community_applications
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();