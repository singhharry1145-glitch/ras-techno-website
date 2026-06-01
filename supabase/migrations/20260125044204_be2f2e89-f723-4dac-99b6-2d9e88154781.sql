-- Create chatbot analytics table to track user queries
CREATE TABLE public.chatbot_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text NOT NULL,
  user_query text NOT NULL,
  bot_response text,
  response_time_ms integer,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.chatbot_analytics ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert analytics (for tracking queries)
CREATE POLICY "Anyone can insert analytics"
ON public.chatbot_analytics
FOR INSERT
WITH CHECK (true);

-- Only admins can view analytics
CREATE POLICY "Admins can view analytics"
ON public.chatbot_analytics
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Only admins can manage analytics
CREATE POLICY "Admins can manage analytics"
ON public.chatbot_analytics
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));