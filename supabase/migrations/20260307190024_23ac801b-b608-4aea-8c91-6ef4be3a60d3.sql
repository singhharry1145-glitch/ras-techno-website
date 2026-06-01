ALTER TABLE public.chatbot_settings 
ADD COLUMN voice_enabled boolean NOT NULL DEFAULT false,
ADD COLUMN voice_speed numeric NOT NULL DEFAULT 1.0,
ADD COLUMN voice_pitch numeric NOT NULL DEFAULT 1.0;