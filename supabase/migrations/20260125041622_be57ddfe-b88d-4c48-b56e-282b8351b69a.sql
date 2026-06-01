-- Create chatbot_settings table for admin control
CREATE TABLE public.chatbot_settings (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    is_enabled boolean NOT NULL DEFAULT true,
    welcome_message text NOT NULL DEFAULT 'Hello! I''m here to help you understand how technology can transform your business. What would you like to know?',
    bot_name text NOT NULL DEFAULT 'RaS Tech Assistant',
    bot_personality text NOT NULL DEFAULT 'You are a helpful technology consultant for RaS Techno. Help users understand how technology solutions like AI, software development, animation, and IT services can benefit their business. Be professional, friendly, and knowledgeable.',
    show_booking_button boolean NOT NULL DEFAULT true,
    booking_button_text text NOT NULL DEFAULT 'Book a Consultation',
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create chatbot_qa table for custom Q&A pairs
CREATE TABLE public.chatbot_qa (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    question text NOT NULL,
    answer text NOT NULL,
    keywords text[] DEFAULT '{}',
    is_active boolean NOT NULL DEFAULT true,
    display_order integer NOT NULL DEFAULT 0,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.chatbot_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chatbot_qa ENABLE ROW LEVEL SECURITY;

-- Policies for chatbot_settings
CREATE POLICY "Anyone can view chatbot settings"
ON public.chatbot_settings
FOR SELECT
USING (true);

CREATE POLICY "Admins can manage chatbot settings"
ON public.chatbot_settings
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Policies for chatbot_qa
CREATE POLICY "Anyone can view active Q&A"
ON public.chatbot_qa
FOR SELECT
USING ((is_active = true) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can manage Q&A"
ON public.chatbot_qa
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Insert default settings
INSERT INTO public.chatbot_settings (id) VALUES (gen_random_uuid());

-- Insert some default Q&A pairs
INSERT INTO public.chatbot_qa (question, answer, keywords, display_order) VALUES
('What services do you offer?', 'We offer Software Development, AI Support & Automation, Animation & Creative Design, IT Services & Consultancy, Data Management & Analytics, and Digital Transformation services.', ARRAY['services', 'offer', 'provide'], 0),
('How can AI help my business?', 'AI can automate repetitive tasks, provide 24/7 customer support through chatbots, analyze data for insights, personalize customer experiences, and optimize operations for cost savings.', ARRAY['ai', 'artificial intelligence', 'automation', 'help'], 1),
('What is digital transformation?', 'Digital transformation involves integrating digital technology into all areas of your business, fundamentally changing how you operate and deliver value to customers. It includes process digitization, cloud migration, and DevOps implementation.', ARRAY['digital', 'transformation', 'modernize'], 2),
('How long does a typical project take?', 'Project timelines vary based on complexity. Simple websites take 2-4 weeks, custom software 2-6 months, and enterprise solutions 6-12 months. We provide detailed timelines during consultation.', ARRAY['time', 'duration', 'long', 'project'], 3),
('How can I book a consultation?', 'You can book a consultation by clicking the "Book a Consultation" button, visiting our contact section, or reaching out directly via email or phone listed on our website.', ARRAY['book', 'consultation', 'appointment', 'meeting'], 4);

-- Create trigger for updated_at
CREATE TRIGGER update_chatbot_settings_updated_at
BEFORE UPDATE ON public.chatbot_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_chatbot_qa_updated_at
BEFORE UPDATE ON public.chatbot_qa
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();