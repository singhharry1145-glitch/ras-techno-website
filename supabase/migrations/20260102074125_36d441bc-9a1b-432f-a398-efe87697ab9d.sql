-- Create job_posts table
CREATE TABLE public.job_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  department TEXT,
  location TEXT,
  employment_type TEXT DEFAULT 'Full-time',
  description TEXT NOT NULL,
  requirements TEXT[],
  benefits TEXT[],
  salary_range TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  posted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create job_applications table
CREATE TABLE public.job_applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  job_post_id UUID REFERENCES public.job_posts(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  resume_url TEXT,
  cover_letter TEXT,
  experience_years INTEGER,
  current_company TEXT,
  linkedin_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create journey_milestones table
CREATE TABLE public.journey_milestones (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  year TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  icon TEXT DEFAULT 'Star',
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.job_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journey_milestones ENABLE ROW LEVEL SECURITY;

-- RLS for job_posts
CREATE POLICY "Anyone can view active job posts" ON public.job_posts
FOR SELECT USING ((is_active = true) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can manage job posts" ON public.job_posts
FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS for job_applications
CREATE POLICY "Anyone can submit applications" ON public.job_applications
FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can manage applications" ON public.job_applications
FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS for journey_milestones
CREATE POLICY "Anyone can view active milestones" ON public.journey_milestones
FOR SELECT USING ((is_active = true) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can manage milestones" ON public.journey_milestones
FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Add triggers for updated_at
CREATE TRIGGER update_job_posts_updated_at
BEFORE UPDATE ON public.job_posts
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_journey_milestones_updated_at
BEFORE UPDATE ON public.journey_milestones
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();