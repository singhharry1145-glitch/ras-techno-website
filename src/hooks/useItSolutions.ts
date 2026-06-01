import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface ItSolution {
  id: string;
  title: string;
  description: string | null;
  icon: string | null;
  image_url: string | null;
  learn_more_url: string | null;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const useItSolutions = () => {
  return useQuery({
    queryKey: ["it_solutions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("it_solutions" as any)
        .select("*")
        .order("display_order", { ascending: true });
      if (error) throw error;
      return data as unknown as ItSolution[];
    },
  });
};

export const useItSolutionsMutations = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const createSolution = useMutation({
    mutationFn: async (solution: Partial<ItSolution>) => {
      const { error } = await supabase.from("it_solutions" as any).insert([solution]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["it_solutions"] });
      toast({ title: "IT Solution added" });
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const updateSolution = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<ItSolution> & { id: string }) => {
      const { error } = await supabase.from("it_solutions" as any).update(updates).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["it_solutions"] });
      toast({ title: "IT Solution updated" });
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const deleteSolution = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("it_solutions" as any).delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["it_solutions"] });
      toast({ title: "IT Solution deleted" });
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const reorderSolutions = useMutation({
    mutationFn: async (items: { id: string; display_order: number }[]) => {
      for (const item of items) {
        const { error } = await supabase
          .from("it_solutions" as any)
          .update({ display_order: item.display_order })
          .eq("id", item.id);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["it_solutions"] });
    },
  });

  return { createSolution, updateSolution, deleteSolution, reorderSolutions };
};
