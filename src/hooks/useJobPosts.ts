import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface JobPost {
  id: string;
  title: string;
  department: string | null;
  location: string | null;
  employment_type: string | null;
  description: string;
  requirements: string[] | null;
  benefits: string[] | null;
  salary_range: string | null;
  is_active: boolean;
  posted_at: string;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
}

export const useJobPosts = () => {
  return useQuery({
    queryKey: ["job-posts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("job_posts")
        .select("*")
        .order("posted_at", { ascending: false });

      if (error) throw error;
      return data as JobPost[];
    },
  });
};

export const useActiveJobPosts = () => {
  return useQuery({
    queryKey: ["active-job-posts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("job_posts")
        .select("*")
        .eq("is_active", true)
        .order("posted_at", { ascending: false });

      if (error) throw error;
      return data as JobPost[];
    },
  });
};

export const useCreateJobPost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (post: Omit<Partial<JobPost>, 'id' | 'created_at' | 'updated_at'> & { title: string; description: string }) => {
      const { data, error } = await supabase
        .from("job_posts")
        .insert([post])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["job-posts"] });
      queryClient.invalidateQueries({ queryKey: ["active-job-posts"] });
    },
  });
};

export const useUpdateJobPost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<JobPost> & { id: string }) => {
      const { data, error } = await supabase
        .from("job_posts")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["job-posts"] });
      queryClient.invalidateQueries({ queryKey: ["active-job-posts"] });
    },
  });
};

export const useDeleteJobPost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("job_posts").delete().eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["job-posts"] });
      queryClient.invalidateQueries({ queryKey: ["active-job-posts"] });
    },
  });
};
