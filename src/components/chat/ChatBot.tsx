import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Bot, User, Calendar, Loader2, Sparkles, Mic, MicOff, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useChatbotSettings } from "@/hooks/useChatbot";
import { useSiteSettings } from "@/hooks/useSiteSettings";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).slice(2)}`);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  const { data: settings } = useChatbotSettings();
  const { data: siteSettings } = useSiteSettings();

  const consultancySettings = siteSettings?.consultancy as Record<string, string> | undefined;
  const appointmentUrl = consultancySettings?.appointmentUrl || "#consultancy";

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Add welcome message when chat opens
  useEffect(() => {
    if (isOpen && messages.length === 0 && settings?.welcome_message) {
      setMessages([
        {
          id: "welcome",
          role: "assistant",
          content: settings.welcome_message,
        },
      ]);
    }
  }, [isOpen, settings?.welcome_message]);

  // Quick reply suggestions
  const quickReplies = [
    "What services do you offer?",
    "Book a consultation",
    "Tell me about AI solutions",
    "How can you help my business?",
  ];

  const sendQuickReply = async (text: string) => {
    if (isLoading) return;
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: text,
    };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    let assistantContent = "";
    const assistantId = (Date.now() + 1).toString();

    try {
      const conversationHistory = messages
        .filter((m) => m.id !== "welcome")
        .map((m) => ({ role: m.role, content: m.content }));

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            message: text,
            sessionId,
            conversationHistory,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to get response");
      }

      if (!response.body) throw new Error("No response body");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";

      setMessages((prev) => [
        ...prev,
        { id: assistantId, role: "assistant", content: "" },
      ]);

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
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              assistantContent += content;
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantId ? { ...m, content: assistantContent } : m
                )
              );
            }
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }
    } catch (error) {
      console.error("Chat error:", error);
      setMessages((prev) => [
        ...prev,
        {
          id: assistantId,
          role: "assistant",
          content: "I'm sorry, I encountered an error. Please try again.",
        },
      ]);
    } finally {
      setIsLoading(false);
      if (assistantContent && settings?.voice_enabled) {
        speakText(assistantContent);
      }
    }
  };

  // Initialize speech recognition with bilingual support (English + Hindi)
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      // Use multilingual recognition - supports both Hindi and English
      recognition.lang = "hi-IN"; // Hindi as primary, browser auto-detects English too
      // Some browsers support multiple languages
      try {
        (recognition as any).languages = ["hi-IN", "en-US"];
      } catch {}

      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0].transcript)
          .join("");
        setInput(transcript);
        if (event.results[0]?.isFinal) {
          setIsListening(false);
        }
      };

      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);

      recognitionRef.current = recognition;
    }

    return () => {
      recognitionRef.current?.abort();
    };
  }, []);

  const toggleVoice = () => {
    if (!recognitionRef.current) return;
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      setInput("");
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  // Text-to-speech function with bilingual support
  const speakText = (text: string) => {
    if (!settings?.voice_enabled || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = settings?.voice_speed || 1.0;
    utterance.pitch = settings?.voice_pitch || 1.0;
    // Detect if text contains Hindi characters
    const hasHindi = /[\u0900-\u097F]/.test(text);
    utterance.lang = hasHindi ? "hi-IN" : "en-US";
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  // Don't render if chatbot is disabled
  if (settings && !settings.is_enabled) {
    return null;
  }


  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    let assistantContent = "";
    const assistantId = (Date.now() + 1).toString();

    try {
      const conversationHistory = messages
        .filter((m) => m.id !== "welcome")
        .map((m) => ({ role: m.role, content: m.content }));

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            message: userMessage.content,
            sessionId,
            conversationHistory,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to get response");
      }

      if (!response.body) throw new Error("No response body");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";

      // Add empty assistant message
      setMessages((prev) => [
        ...prev,
        { id: assistantId, role: "assistant", content: "" },
      ]);

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
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              assistantContent += content;
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantId ? { ...m, content: assistantContent } : m
                )
              );
            }
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }
    } catch (error) {
      console.error("Chat error:", error);
      setMessages((prev) => [
        ...prev,
        {
          id: assistantId,
          role: "assistant",
          content: "I'm sorry, I encountered an error. Please try again.",
        },
      ]);
    } finally {
      setIsLoading(false);
      // Speak the final response if voice is enabled
      if (assistantContent && settings?.voice_enabled) {
        speakText(assistantContent);
      }
    }
  };

  const handleBooking = () => {
    if (appointmentUrl?.startsWith("http")) {
      window.open(appointmentUrl, "_blank", "noopener,noreferrer");
      setIsOpen(false);
      return;
    }
    // Consultancy section was removed — fall back to the contact section
    const target =
      document.getElementById("contact") ||
      document.getElementById("consultancy");
    if (target) {
      target.scrollIntoView({ behavior: "smooth" });
      setIsOpen(false);
    }
  };

  return (
    <>
      {/* Chat Button - Positioned above the appointment button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-[5.5rem] right-4 z-[60] w-12 h-12 sm:w-14 sm:h-14 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 group"
        style={{
          background: "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--secondary)))",
          boxShadow: isOpen 
            ? "0 0 30px hsl(var(--primary) / 0.6), 0 0 60px hsl(var(--secondary) / 0.3)"
            : "0 8px 32px hsl(var(--primary) / 0.4), 0 4px 16px hsl(var(--secondary) / 0.3)",
          transform: isOpen ? "rotateY(180deg)" : "rotateY(0deg)",
          transformStyle: "preserve-3d",
        }}
        aria-label={isOpen ? "Close chat" : "Open chat"}
      >
        {/* 3D Ring Effect */}
        <span 
          className="absolute inset-0 rounded-full animate-ping opacity-30"
          style={{ background: "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--secondary)))" }}
        />
        <span 
          className="absolute inset-[-4px] rounded-full opacity-50 blur-sm"
          style={{ background: "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--secondary)))" }}
        />
        
        {/* Icon with 3D flip */}
        <span 
          className="relative z-10 transition-transform duration-300"
          style={{ transform: isOpen ? "rotateY(180deg)" : "rotateY(0deg)" }}
        >
          {isOpen ? (
            <X className="w-6 h-6 text-white" />
          ) : (
            <MessageCircle className="w-6 h-6 text-white" />
          )}
        </span>
        
        {/* Sparkle effect */}
        {!isOpen && (
          <Sparkles className="absolute -top-1 -right-1 w-4 h-4 text-yellow-300 animate-pulse" />
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div 
          className="fixed bottom-[8rem] right-4 z-[60] w-[360px] max-w-[calc(100vw-2rem)] h-[420px] max-h-[calc(100vh-12rem)] bg-background/95 backdrop-blur-xl border border-border/50 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-scale-in"
          style={{
            boxShadow: "0 25px 50px -12px hsl(var(--primary) / 0.25), 0 0 0 1px hsl(var(--border) / 0.5)",
          }}
        >
          {/* Header */}
          <div 
            className="p-4 text-white flex items-center gap-3"
            style={{ background: "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--secondary)))" }}
          >
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
              <Bot className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold">{settings?.bot_name || "RaS Tech Assistant"}</h3>
              <p className="text-xs text-white/80">Ask me about technology solutions</p>
            </div>
            {settings?.voice_enabled && (
              <button
                onClick={isSpeaking ? stopSpeaking : undefined}
                className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors"
                title={isSpeaking ? "Stop speaking" : "Voice enabled"}
              >
                {isSpeaking ? (
                  <VolumeX className="w-4 h-4 animate-pulse" />
                ) : (
                  <Volume2 className="w-4 h-4" />
                )}
              </button>
            )}
          </div>

          {/* Messages */}
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-2 ${message.role === "user" ? "flex-row-reverse" : ""}`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                      message.role === "user"
                        ? "bg-primary text-white"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {message.role === "user" ? (
                      <User className="w-4 h-4" />
                    ) : (
                      <Bot className="w-4 h-4" />
                    )}
                  </div>
                  <div
                    className={`max-w-[75%] p-3 rounded-2xl text-sm ${
                      message.role === "user"
                        ? "bg-primary text-white rounded-br-none"
                        : "bg-muted text-foreground rounded-bl-none"
                    }`}
                  >
                    {message.content || (
                      <span className="flex items-center gap-1">
                        <Loader2 className="w-3 h-3 animate-spin" /> Thinking...
                      </span>
                    )}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Quick Reply Suggestions - show when only welcome message exists */}
          {messages.length <= 1 && (
            <div className="px-4 pb-2 flex flex-wrap gap-2">
              {quickReplies.map((text) => (
                <button
                  key={text}
                  onClick={() => sendQuickReply(text)}
                  disabled={isLoading}
                  className="text-xs px-3 py-1.5 rounded-full border border-primary/30 text-primary bg-primary/5 hover:bg-primary/10 transition-colors whitespace-nowrap disabled:opacity-50"
                >
                  {text}
                </button>
              ))}
            </div>
          )}

          {/* Booking Button */}
          {settings?.show_booking_button && (
            <div className="px-4 pb-2">
              <Button
                variant="outline"
                size="sm"
                className="w-full border-primary text-primary hover:bg-primary hover:text-white"
                onClick={handleBooking}
              >
                <Calendar className="w-4 h-4 mr-2" />
                {settings?.booking_button_text || "Get in Touch"}
              </Button>
            </div>
          )}

          {/* Input */}
          <div className="p-4 border-t border-border/50">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                sendMessage();
              }}
              className="flex gap-2"
            >
              <Input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={isListening ? "Listening..." : "Type or speak..."}
                disabled={isLoading}
                className={`flex-1 bg-muted/50 ${isListening ? "border-primary animate-pulse" : ""}`}
              />
              {recognitionRef.current && (
                <Button
                  type="button"
                  size="icon"
                  variant={isListening ? "default" : "outline"}
                  onClick={toggleVoice}
                  disabled={isLoading}
                  className={`shrink-0 ${isListening ? "bg-destructive hover:bg-destructive/90" : ""}`}
                >
                  {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </Button>
              )}
              <Button
                type="submit"
                size="icon"
                disabled={!input.trim() || isLoading}
                className="shrink-0"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatBot;
