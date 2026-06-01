import { useState, useEffect } from "react";
import { Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSiteSettings } from "@/hooks/useSiteSettings";

const FloatingAppointmentButton = () => {
  const [isVisible, setIsVisible] = useState(false);
  const { data: settings } = useSiteSettings();

  useEffect(() => {
    const handleScroll = () => {
      // Show button after scrolling past hero section (roughly 500px)
      setIsVisible(window.scrollY > 500);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleClick = () => {
    // Check if there's a custom appointment URL
    const consultancySettings = settings?.consultancy as Record<string, string> | undefined;
    const appointmentUrl = consultancySettings?.appointmentUrl;

    if (appointmentUrl) {
      window.open(appointmentUrl, "_blank");
    } else {
      // Default to scrolling to consultancy section
      document.getElementById("consultancy")?.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-[55] transition-all duration-300 px-4 pb-3 pt-2 ${
        isVisible ? "translate-y-0 opacity-100" : "translate-y-full opacity-0 pointer-events-none"
      }`}
      style={{
        background: "linear-gradient(to top, hsl(var(--background)) 60%, transparent)",
      }}
    >
      <Button
        variant="glow"
        size="lg"
        onClick={handleClick}
        className="w-full max-w-md mx-auto rounded-full shadow-lg hover:shadow-xl transition-all duration-300 group hover:scale-[1.02] flex"
        style={{
          boxShadow: "0 8px 32px hsl(var(--primary) / 0.3), 0 4px 16px hsl(var(--secondary) / 0.2)",
        }}
      >
        <Calendar className="w-5 h-5 mr-2 group-hover:animate-pulse" />
        Book Appointment
      </Button>
    </div>
  );
};

export default FloatingAppointmentButton;
