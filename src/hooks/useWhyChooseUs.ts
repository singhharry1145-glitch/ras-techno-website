import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface WhyChooseUsItem {
  id: string;
  title: string;
  description: string | null;
  icon: string | null;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const useWhyChooseUs = () => {
  return useQuery({
    queryKey: ["why_choose_us"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("why_choose_us" as any)
        .select("*")
        .order("display_order", { ascending: true });
      if (error) throw error;
      return data as unknown as WhyChooseUsItem[];
    },
  });
};

export const useWhyChooseUsMutations = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const createItem = useMutation({
    mutationFn: async (item: Partial<WhyChooseUsItem>) => {
      const { error } = await supabase.from("why_choose_us" as any).insert([item]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["why_choose_us"] });
      toast({ title: "Item added" });
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const updateItem = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<WhyChooseUsItem> & { id: string }) => {
      const { error } = await supabase.from("why_choose_us" as any).update(updates).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["why_choose_us"] });
      toast({ title: "Item updated" });
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const deleteItem = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("why_choose_us" as any).delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["why_choose_us"] });
      toast({ title: "Item deleted" });
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  return { createItem, updateItem, deleteItem };
};
