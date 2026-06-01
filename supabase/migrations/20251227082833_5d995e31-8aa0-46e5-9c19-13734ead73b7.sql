-- Create services table for dynamic service management
CREATE TABLE public.services (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    icon TEXT NOT NULL DEFAULT 'Settings',
    color TEXT NOT NULL DEFAULT 'cyan',
    features TEXT[] NOT NULL DEFAULT '{}',
    display_order INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view active services" 
ON public.services 
FOR SELECT 
USING (is_active = true OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can manage services" 
ON public.services 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_services_updated_at
BEFORE UPDATE ON public.services
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default services
INSERT INTO public.services (title, description, icon, color, features, display_order) VALUES
('Animation & Creative Design', 'Bring your brand to life with captivating 2D/3D animations, motion graphics, and visual storytelling.', 'Palette', 'cyan', ARRAY['2D & 3D Animation', 'Motion Graphics', 'Visual Effects', 'Brand Storytelling', 'Character Design'], 1),
('Software Development', 'Custom software solutions tailored to your business needs, from web applications to enterprise systems.', 'Code', 'magenta', ARRAY['Web Development', 'Mobile Apps', 'Enterprise Software', 'API Development', 'Cloud Solutions'], 2),
('AI Support & Automation', 'Leverage cutting-edge AI and automation to streamline operations and boost productivity.', 'Bot', 'purple', ARRAY['AI Integration', 'Chatbots & Virtual Assistants', 'Process Automation', 'Machine Learning', 'Intelligent Analytics'], 3),
('IT Services & Consultancy', 'Comprehensive IT support and strategic consultancy to optimize your technology infrastructure.', 'Settings', 'orange', ARRAY['IT Strategy & Planning', 'System Integration', 'Technical Support', 'Infrastructure Management', 'Security Consulting'], 4),
('Data Management & Analytics', 'Transform raw data into actionable insights with advanced analytics and data engineering.', 'Database', 'cyan', ARRAY['Data Engineering', 'Business Intelligence', 'Data Visualization', 'Database Design', 'Analytics Dashboards'], 5),
('Digital Transformation', 'End-to-end digital transformation services to modernize your business and stay competitive.', 'Zap', 'magenta', ARRAY['Process Digitization', 'Legacy System Modernization', 'Cloud Migration', 'DevOps Implementation', 'Change Management'], 6);

-- Create images storage bucket for section images
INSERT INTO storage.buckets (id, name, public) VALUES ('images', 'images', true);

-- Storage policies for images bucket
CREATE POLICY "Anyone can view images" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'images');

CREATE POLICY "Admins can upload images" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'images' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update images" 
ON storage.objects FOR UPDATE 
USING (bucket_id = 'images' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete images" 
ON storage.objects FOR DELETE 
USING (bucket_id = 'images' AND has_role(auth.uid(), 'admin'::app_role));