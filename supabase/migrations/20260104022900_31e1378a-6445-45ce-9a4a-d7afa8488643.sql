-- Create awards_certificates table
CREATE TABLE public.awards_certificates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  issuer TEXT,
  description TEXT,
  image_url TEXT,
  date_received DATE,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.awards_certificates ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Anyone can view active awards" ON public.awards_certificates
FOR SELECT USING (is_active = true OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can manage awards" ON public.awards_certificates
FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Trigger for updated_at
CREATE TRIGGER update_awards_certificates_updated_at
BEFORE UPDATE ON public.awards_certificates
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();