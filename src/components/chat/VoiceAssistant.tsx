import { useState, useRef } from "react";
import { Mic, MicOff, Volume2, X, Loader2, Languages, Calendar } from "lucide-react";
import { useChatbotSettings } from "@/hooks/useChatbot";
import { useSiteSettings } from "@/hooks/useSiteSettings";

type Lang = "hi-IN" | "en-US";
type Status = "idle" | "listening" | "processing" | "speaking";

const VoiceAssistant = () => {
  const [status, setStatus] = useState<Status>("idle");
  const [transcript, setTranscript] = useState("");
  const [response, setResponse] = useState("");
  const [isVisible, setIsVisible] = useState(false);
  const [lang, setLang] = useState<Lang>("en-US");
  const recognitionRef = useRef<any>(null);
  const sessionIdRef = useRef(`voice_${Date.now()}_${Math.random().toString(36).slice(2)}`);

  const { data: settings } = useChatbotSettings();
  const { data: siteSettings } = useSiteSettings();

  if (settings && !settings.voice_enabled) return null;
  if (settings && !settings.is_enabled) return null;

  const handleBookAppointment = () => {
    const consultancySettings = siteSettings?.consultancy as Record<string, string> | undefined;
    const appointmentUrl = consultancySettings?.appointmentUrl;
    if (appointmentUrl && appointmentUrl.startsWith("http")) {
      window.open(appointmentUrl, "_blank", "noopener,noreferrer");
      stopAll();
      return;
    }
    // Consultancy section removed — route to the contact section
    const target =
      document.getElementById("contact") ||
      document.getElementById("consultancy");
    if (target) {
      target.scrollIntoView({ behavior: "smooth" });
      stopAll();
    }
  };

  const speakText = (text: string) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = settings?.voice_speed || 1.0;
    utterance.pitch = settings?.voice_pitch || 1.0;
    const hasHindi = /[\u0900-\u097F]/.test(text);
    utterance.lang = hasHindi ? "hi-IN" : "en-US";
    utterance.onstart = () => setStatus("speaking");
    utterance.onend = () => {
      setStatus("idle");
      setTimeout(() => {
        setTranscript("");
        setResponse("");
      }, 3000);
    };
    utterance.onerror = () => setStatus("idle");
    window.speechSynthesis.speak(utterance);
  };

  const sendToAI = async (message: string) => {
    setStatus("processing");
    let assistantContent = "";

    try {
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            message,
            sessionId: sessionIdRef.current,
            conversationHistory: [],
          }),
        }
      );

      if (!res.ok) throw new Error("AI request failed");
      if (!res.body) throw new Error("No response body");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              assistantContent += content;
              setResponse(assistantContent);
            }
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }

      if (assistantContent) {
        const cleanText = assistantContent
          .replace(/[*_~`#]/g, "")
          .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
          .replace(/\n+/g, ". ");
        speakText(cleanText);
      }
    } catch (error) {
      console.error("Voice AI error:", error);
      setResponse("Sorry, I couldn't process that. Please try again.");
      setStatus("idle");
    }
  };

  const startListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setResponse("Speech recognition not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = lang;

    recognition.onresult = (event: any) => {
      const text = Array.from(event.results)
        .map((r: any) => r[0].transcript)
        .join("");
      setTranscript(text);
      if (event.results[0]?.isFinal) {
        setStatus("processing");
        sendToAI(text);
      }
    };

    recognition.onerror = () => setStatus("idle");
    recognition.onend = () => {
      if (status === "listening") setStatus("idle");
    };

    recognitionRef.current = recognition;
    recognition.start();
    setStatus("listening");
    setTranscript("");
    setResponse("");
    setIsVisible(true);
  };

  const stopAll = () => {
    recognitionRef.current?.abort();
    window.speechSynthesis.cancel();
    setStatus("idle");
    setTranscript("");
    setResponse("");
    setIsVisible(false);
  };

  const toggleVoice = () => {
    if (status === "idle" && !isVisible) {
      startListening();
    } else if (status === "listening") {
      recognitionRef.current?.stop();
      setStatus("idle");
    } else if (status === "speaking") {
      window.speechSynthesis.cancel();
      setStatus("idle");
    } else if (status === "idle" && isVisible) {
      startListening();
    }
  };

  const statusColors = {
    idle: "hsl(var(--primary))",
    listening: "hsl(0, 85%, 55%)",
    processing: "hsl(45, 90%, 50%)",
    speaking: "hsl(140, 70%, 45%)",
  };

  const statusLabels = {
    idle: "Tap to speak",
    listening: "Listening...",
    processing: "Thinking...",
    speaking: "Speaking...",
  };

  return (
    <>
      {/* Floating Voice Button - bottom left, stacked above appointment */}
      <button
        onClick={toggleVoice}
        className="fixed bottom-[4.5rem] left-4 z-[60] w-12 h-12 sm:w-14 sm:h-14 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-110"
        style={{
          background: `linear-gradient(135deg, ${statusColors[status]}, hsl(var(--secondary)))`,
          boxShadow: `0 8px 32px ${statusColors[status]}66`,
        }}
        aria-label="Voice Assistant"
      >
        {(status === "listening" || status === "speaking") && (
          <>
            <span
              className="absolute inset-0 rounded-full animate-ping opacity-30"
              style={{ background: statusColors[status] }}
            />
            <span
              className="absolute inset-[-6px] rounded-full opacity-20 animate-pulse"
              style={{ background: statusColors[status] }}
            />
          </>
        )}
        <span className="relative z-10">
          {status === "listening" ? (
            <Mic className="w-6 h-6 text-white animate-pulse" />
          ) : status === "processing" ? (
            <Loader2 className="w-6 h-6 text-white animate-spin" />
          ) : status === "speaking" ? (
            <Volume2 className="w-6 h-6 text-white animate-pulse" />
          ) : (
            <Mic className="w-6 h-6 text-white" />
          )}
        </span>
      </button>

      {/* Transcript/Response Panel */}
      {isVisible && (
        <div
          className="fixed bottom-[8rem] left-4 z-[60] w-[300px] max-w-[calc(100vw-3rem)] bg-background/95 backdrop-blur-xl border border-border/50 rounded-2xl shadow-2xl overflow-hidden animate-scale-in"
          style={{
            boxShadow: `0 25px 50px -12px ${statusColors[status]}40`,
          }}
        >
          {/* Header */}
          <div
            className="p-3 text-white flex items-center justify-between"
            style={{ background: `linear-gradient(135deg, ${statusColors[status]}, hsl(var(--secondary)))` }}
          >
            <div className="flex items-center gap-2">
              <Mic className="w-4 h-4" />
              <span className="text-sm font-medium">
                {settings?.bot_name || "RaS"} Voice
              </span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded-full">
                {statusLabels[status]}
              </span>
              <button
                onClick={stopAll}
                className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Language Toggle */}
          <div className="px-3 py-2 border-b border-border/30 flex items-center justify-center gap-2">
            <Languages className="w-3.5 h-3.5 text-muted-foreground" />
            <div className="flex rounded-full bg-muted/50 p-0.5">
              <button
                onClick={() => setLang("en-US")}
                className={`text-xs px-3 py-1 rounded-full transition-colors ${
                  lang === "en-US"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                English
              </button>
              <button
                onClick={() => setLang("hi-IN")}
                className={`text-xs px-3 py-1 rounded-full transition-colors ${
                  lang === "hi-IN"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                हिन्दी
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-3 max-h-[180px] overflow-y-auto space-y-2">
            {transcript && (
              <div>
                <p className="text-xs text-muted-foreground mb-1">You said:</p>
                <p className="text-sm text-foreground bg-primary/10 rounded-lg p-2">{transcript}</p>
              </div>
            )}
            {response && (
              <div>
                <p className="text-xs text-muted-foreground mb-1">Assistant:</p>
                <p className="text-sm text-foreground bg-muted rounded-lg p-2">{response}</p>
              </div>
            )}
            {status === "processing" && !response && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" />
                Processing your request...
              </div>
            )}
            {status === "idle" && !transcript && !response && (
              <p className="text-sm text-muted-foreground text-center py-2">
                🎤 Tap the mic button to ask a question
              </p>
            )}
          </div>

          {/* Bottom actions */}
          <div className="px-3 pb-3 space-y-2">
            {status === "idle" && (transcript || response) && (
              <button
                onClick={startListening}
                className="w-full text-sm py-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
              >
                🎤 Ask another question
              </button>
            )}
            {/* Book Appointment Button */}
            <button
              onClick={handleBookAppointment}
              className="w-full text-sm py-2 rounded-lg bg-accent/80 text-accent-foreground hover:bg-accent transition-colors flex items-center justify-center gap-2"
            >
              <Calendar className="w-4 h-4" />
              {settings?.booking_button_text || "Get in Touch"}
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default VoiceAssistant;
