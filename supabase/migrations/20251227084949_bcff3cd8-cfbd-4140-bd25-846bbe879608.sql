-- Create testimonials table
CREATE TABLE public.testimonials (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_name TEXT NOT NULL,
  client_position TEXT,
  client_company TEXT,
  client_image TEXT,
  content TEXT NOT NULL,
  rating INTEGER DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
  is_published BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create blogs table
CREATE TABLE public.blogs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  excerpt TEXT,
  content TEXT NOT NULL,
  cover_image TEXT,
  author TEXT NOT NULL DEFAULT 'Admin',
  category TEXT,
  tags TEXT[] DEFAULT '{}'::text[],
  is_published BOOLEAN NOT NULL DEFAULT true,
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create clients table
CREATE TABLE public.clients (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  logo_url TEXT,
  website_url TEXT,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blogs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

-- Testimonials policies
CREATE POLICY "Anyone can view published testimonials" 
ON public.testimonials 
FOR SELECT 
USING ((is_published = true) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can manage testimonials" 
ON public.testimonials 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Blogs policies
CREATE POLICY "Anyone can view published blogs" 
ON public.blogs 
FOR SELECT 
USING ((is_published = true) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can manage blogs" 
ON public.blogs 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Clients policies
CREATE POLICY "Anyone can view active clients" 
ON public.clients 
FOR SELECT 
USING ((is_active = true) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can manage clients" 
ON public.clients 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Triggers for updated_at
CREATE TRIGGER update_testimonials_updated_at
BEFORE UPDATE ON public.testimonials
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_blogs_updated_at
BEFORE UPDATE ON public.blogs
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_clients_updated_at
BEFORE UPDATE ON public.clients
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample data
INSERT INTO public.testimonials (client_name, client_position, client_company, content, rating, display_order) VALUES
('Rahul Sharma', 'CTO', 'TechCorp India', 'RAS Techno delivered exceptional IT solutions that transformed our business operations. Their team is professional and innovative.', 5, 1),
('Priya Patel', 'CEO', 'InnovateTech', 'Outstanding service and support. They understood our requirements perfectly and delivered beyond expectations.', 5, 2),
('Amit Kumar', 'Director', 'Digital Solutions', 'The AI solutions they implemented have significantly improved our efficiency. Highly recommended!', 5, 3);

INSERT INTO public.clients (name, description, display_order) VALUES
('TechCorp India', 'Leading technology company', 1),
('InnovateTech', 'Innovation solutions provider', 2),
('Digital Solutions', 'Digital transformation experts', 3),
('CloudNet Systems', 'Cloud infrastructure provider', 4),
('DataDrive Analytics', 'Data analytics company', 5);