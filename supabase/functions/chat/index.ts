import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ChatRequest {
  message: string;
  sessionId: string;
  conversationHistory?: Array<{ role: string; content: string }>;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();

  try {
    const { message, sessionId, conversationHistory = [] }: ChatRequest = await req.json();

    if (!message) {
      return new Response(
        JSON.stringify({ error: "Message is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Create Supabase client to fetch settings
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch chatbot settings
    const { data: settingsData } = await supabase
      .from("chatbot_settings")
      .select("*")
      .limit(1)
      .maybeSingle();

    // Fetch custom Q&A pairs
    const { data: qaData } = await supabase
      .from("chatbot_qa")
      .select("*")
      .eq("is_active", true)
      .order("display_order", { ascending: true });

    // Build custom knowledge base
    let customKnowledge = "";
    if (qaData && qaData.length > 0) {
      customKnowledge = "\n\nCustom Knowledge Base (prioritize these for relevant questions):\n";
      qaData.forEach((qa: any) => {
        customKnowledge += `Q: ${qa.question}\nA: ${qa.answer}\n\n`;
      });
    }

    // Build system prompt
    const botPersonality = settingsData?.bot_personality || 
      "You are a helpful technology consultant for RaS Techno. Help users understand how technology solutions like AI, software development, animation, and IT services can benefit their business. Be professional, friendly, and knowledgeable.";

    const systemPrompt = `${botPersonality}

Company: RaS Techno
Services: Software Development, AI Support & Automation, Animation & Creative Design, IT Services & Consultancy, Data Management & Analytics, Digital Transformation

IMPORTANT GUIDELINES:
1. Always be helpful and professional
2. Focus on how technology can benefit businesses
3. If asked about booking/consultation, encourage them to use the booking button
4. Keep responses concise but informative
5. If you don't know something specific about RaS Techno, provide general industry knowledge
6. You are bilingual - respond in the SAME LANGUAGE the user writes in. If the user writes in Hindi (or Hinglish), reply in Hindi. If in English, reply in English. You can also handle mixed Hindi-English (Hinglish) naturally.
${customKnowledge}`;

    // Build messages array
    const messages = [
      { role: "system", content: systemPrompt },
      ...conversationHistory.slice(-10), // Keep last 10 messages for context
      { role: "user", content: message }
    ];

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages,
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI service quota exceeded." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "AI service error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Log analytics (non-blocking)
    const responseTime = Date.now() - startTime;
    (async () => {
      try {
        await supabase
          .from("chatbot_analytics")
          .insert({
            session_id: sessionId || "anonymous",
            user_query: message,
            response_time_ms: responseTime,
          });
      } catch (err) {
        console.error("Analytics insert error:", err);
      }
    })();

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("Chat error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
