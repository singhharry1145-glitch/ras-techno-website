import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface CommunityMeeting {
  id: string;
  title: string;
  description: string | null;
  meeting_date: string;
  attendees_count: number;
  location: string | null;
  is_published: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export const useCommunityMeetings = (publishedOnly = false) => {
  return useQuery({
    queryKey: ["community-meetings", publishedOnly],
    queryFn: async () => {
      let q = supabase.from("community_meetings").select("*").order("meeting_date", { ascending: false });
      if (publishedOnly) q = q.eq("is_published", true);
      const { data, error } = await q;
      if (error) throw error;
      return data as CommunityMeeting[];
    },
  });
};

export const useUpsertCommunityMeeting = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (m: Partial<CommunityMeeting> & { title: string; meeting_date: string }) => {
      if (m.id) {
        const { error } = await supabase.from("community_meetings").update(m).eq("id", m.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("community_meetings").insert([m]);
        if (error) throw error;
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["community-meetings"] }),
  });
};

export const useDeleteCommunityMeeting = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("community_meetings").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["community-meetings"] }),
  });
};

export const useCommunityStats = () => {
  return useQuery({
    queryKey: ["community-stats"],
    queryFn: async () => {
      const [{ count: approvedCount }, { count: totalApps }, { data: meetings }] = await Promise.all([
        supabase.from("community_applications").select("*", { count: "exact", head: true }).eq("status", "approved"),
        supabase.from("community_applications").select("*", { count: "exact", head: true }),
        supabase.from("community_meetings").select("*").eq("is_published", true),
      ]);
      const totalAttendees = (meetings || []).reduce((s, m: any) => s + (m.attendees_count || 0), 0);
      return {
        members: approvedCount || 0,
        applications: totalApps || 0,
        meetings: meetings?.length || 0,
        totalAttendees,
      };
    },
  });
};
