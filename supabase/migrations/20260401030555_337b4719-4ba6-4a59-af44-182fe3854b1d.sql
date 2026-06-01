
-- IT Solutions table
CREATE TABLE public.it_solutions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  icon TEXT DEFAULT 'Settings',
  image_url TEXT,
  learn_more_url TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.it_solutions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active IT solutions" ON public.it_solutions
  FOR SELECT USING (is_active = true OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage IT solutions" ON public.it_solutions
  FOR ALL USING (has_role(auth.uid(), 'admin'));

-- Why Choose Us table
CREATE TABLE public.why_choose_us (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  icon TEXT DEFAULT 'Star',
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.why_choose_us ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active why choose us" ON public.why_choose_us
  FOR SELECT USING (is_active = true OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage why choose us" ON public.why_choose_us
  FOR ALL USING (has_role(auth.uid(), 'admin'));
