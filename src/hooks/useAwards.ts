import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Award {
  id: string;
  title: string;
  issuer: string | null;
  description: string | null;
  image_url: string | null;
  date_received: string | null;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const useAwards = () => {
  return useQuery({
    queryKey: ["awards"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("awards_certificates")
        .select("*")
        .order("display_order", { ascending: true });

      if (error) throw error;
      return data as Award[];
    },
  });
};

export const useActiveAwards = () => {
  return useQuery({
    queryKey: ["awards", "active"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("awards_certificates")
        .select("*")
        .eq("is_active", true)
        .order("display_order", { ascending: true });

      if (error) throw error;
      return data as Award[];
    },
  });
};

export const useCreateAward = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (award: Omit<Award, "id" | "created_at" | "updated_at">) => {
      const { data, error } = await supabase
        .from("awards_certificates")
        .insert(award)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["awards"] });
    },
  });
};

export const useUpdateAward = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...award }: Partial<Award> & { id: string }) => {
      const { data, error } = await supabase
        .from("awards_certificates")
        .update(award)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["awards"] });
    },
  });
};

export const useDeleteAward = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("awards_certificates")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["awards"] });
    },
  });
};
