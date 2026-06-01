import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface CommunityApplication {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  business_name: string | null;
  business_type: string | null;
  interests: string | null;
  message: string | null;
  status: string;
  is_read: boolean;
  created_at: string;
  updated_at: string;
}

export const useCommunityApplications = () => {
  return useQuery({
    queryKey: ["community-applications"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("community_applications")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as CommunityApplication[];
    },
  });
};

export const useSubmitCommunityApplication = () => {
  return useMutation({
    mutationFn: async (payload: {
      name: string;
      email: string;
      phone?: string;
      business_name?: string;
      business_type?: string;
      interests?: string;
      message?: string;
    }) => {
      const { error } = await supabase.from("community_applications").insert([payload]);
      if (error) throw error;
    },
  });
};

export const useUpdateCommunityApplication = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<CommunityApplication> & { id: string }) => {
      const { error } = await supabase
        .from("community_applications")
        .update(updates)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["community-applications"] }),
  });
};

export const useDeleteCommunityApplication = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("community_applications").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["community-applications"] }),
  });
};
