import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface ChatbotAnalytics {
  id: string;
  session_id: string;
  user_query: string;
  bot_response: string | null;
  response_time_ms: number | null;
  created_at: string;
}

export interface AnalyticsSummary {
  totalQueries: number;
  uniqueSessions: number;
  avgResponseTime: number;
  queriesThisWeek: number;
  queriesThisMonth: number;
  topQueries: { query: string; count: number }[];
  queriesByDay: { date: string; count: number }[];
}

export const useChatbotAnalytics = () => {
  return useQuery({
    queryKey: ["chatbot-analytics"],
    queryFn: async (): Promise<ChatbotAnalytics[]> => {
      const { data, error } = await supabase
        .from("chatbot_analytics")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(500);

      if (error) throw error;
      return (data || []) as ChatbotAnalytics[];
    },
  });
};

export const useChatbotAnalyticsSummary = () => {
  return useQuery({
    queryKey: ["chatbot-analytics-summary"],
    queryFn: async (): Promise<AnalyticsSummary> => {
      const { data, error } = await supabase
        .from("chatbot_analytics")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      const analytics = (data || []) as ChatbotAnalytics[];
      
      const now = new Date();
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      // Calculate metrics
      const totalQueries = analytics.length;
      const uniqueSessions = new Set(analytics.map(a => a.session_id)).size;
      const avgResponseTime = analytics.reduce((sum, a) => sum + (a.response_time_ms || 0), 0) / (totalQueries || 1);
      
      const queriesThisWeek = analytics.filter(a => new Date(a.created_at) >= oneWeekAgo).length;
      const queriesThisMonth = analytics.filter(a => new Date(a.created_at) >= oneMonthAgo).length;

      // Top queries (by similarity - simplified approach)
      const queryMap = new Map<string, number>();
      analytics.forEach(a => {
        const normalizedQuery = a.user_query.toLowerCase().trim();
        queryMap.set(normalizedQuery, (queryMap.get(normalizedQuery) || 0) + 1);
      });
      
      const topQueries = Array.from(queryMap.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([query, count]) => ({ query, count }));

      // Queries by day (last 7 days)
      const dayMap = new Map<string, number>();
      for (let i = 6; i >= 0; i--) {
        const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        const dateStr = date.toISOString().split("T")[0];
        dayMap.set(dateStr, 0);
      }
      
      analytics.forEach(a => {
        const dateStr = a.created_at.split("T")[0];
        if (dayMap.has(dateStr)) {
          dayMap.set(dateStr, (dayMap.get(dateStr) || 0) + 1);
        }
      });

      const queriesByDay = Array.from(dayMap.entries()).map(([date, count]) => ({ date, count }));

      return {
        totalQueries,
        uniqueSessions,
        avgResponseTime: Math.round(avgResponseTime),
        queriesThisWeek,
        queriesThisMonth,
        topQueries,
        queriesByDay,
      };
    },
  });
};
