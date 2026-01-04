import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface JourneyMilestone {
  id: string;
  year: string;
  title: string;
  description: string | null;
  icon: string | null;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const useJourneyMilestones = () => {
  return useQuery({
    queryKey: ["journey-milestones"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("journey_milestones")
        .select("*")
        .order("display_order", { ascending: true });

      if (error) throw error;
      return data as JourneyMilestone[];
    },
  });
};

export const useActiveJourneyMilestones = () => {
  return useQuery({
    queryKey: ["active-journey-milestones"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("journey_milestones")
        .select("*")
        .eq("is_active", true)
        .order("display_order", { ascending: true });

      if (error) throw error;
      return data as JourneyMilestone[];
    },
  });
};

export const useCreateJourneyMilestone = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (milestone: Omit<Partial<JourneyMilestone>, 'id' | 'created_at' | 'updated_at'> & { year: string; title: string }) => {
      const { data, error } = await supabase
        .from("journey_milestones")
        .insert([milestone])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["journey-milestones"] });
      queryClient.invalidateQueries({ queryKey: ["active-journey-milestones"] });
    },
  });
};

export const useUpdateJourneyMilestone = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<JourneyMilestone> & { id: string }) => {
      const { data, error } = await supabase
        .from("journey_milestones")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["journey-milestones"] });
      queryClient.invalidateQueries({ queryKey: ["active-journey-milestones"] });
    },
  });
};

export const useDeleteJourneyMilestone = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("journey_milestones").delete().eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["journey-milestones"] });
      queryClient.invalidateQueries({ queryKey: ["active-journey-milestones"] });
    },
  });
};
