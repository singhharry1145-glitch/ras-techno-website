import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Json } from "@/integrations/supabase/types";

export interface ChatbotSettings {
  id: string;
  is_enabled: boolean;
  welcome_message: string;
  bot_name: string;
  bot_personality: string;
  show_booking_button: boolean;
  booking_button_text: string;
  voice_enabled: boolean;
  voice_speed: number;
  voice_pitch: number;
  created_at: string;
  updated_at: string;
}

export interface ChatbotQA {
  id: string;
  question: string;
  answer: string;
  keywords: string[];
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export const useChatbotSettings = () => {
  return useQuery({
    queryKey: ["chatbot-settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("chatbot_settings")
        .select("*")
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data as ChatbotSettings | null;
    },
  });
};

export const useUpdateChatbotSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (settings: Partial<ChatbotSettings>) => {
      const { data: existing } = await supabase
        .from("chatbot_settings")
        .select("id")
        .limit(1)
        .maybeSingle();

      if (existing) {
        const { error } = await supabase
          .from("chatbot_settings")
          .update(settings as any)
          .eq("id", existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("chatbot_settings")
          .insert(settings as any);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chatbot-settings"] });
    },
  });
};

export const useChatbotQA = () => {
  return useQuery({
    queryKey: ["chatbot-qa"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("chatbot_qa")
        .select("*")
        .order("display_order", { ascending: true });

      if (error) throw error;
      return data as ChatbotQA[];
    },
  });
};

export const useCreateChatbotQA = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (qa: Omit<ChatbotQA, "id" | "created_at" | "updated_at">) => {
      const { error } = await supabase
        .from("chatbot_qa")
        .insert(qa as any);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chatbot-qa"] });
    },
  });
};

export const useUpdateChatbotQA = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...qa }: Partial<ChatbotQA> & { id: string }) => {
      const { error } = await supabase
        .from("chatbot_qa")
        .update(qa as any)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chatbot-qa"] });
    },
  });
};

export const useDeleteChatbotQA = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("chatbot_qa")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chatbot-qa"] });
    },
  });
};
