import { useState } from "react";
import { Mail, Phone, MapPin, Check, Send, Loader2, CheckCircle2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useSubmitContactMessage } from "@/hooks/useContactMessages";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { cn } from "@/lib/utils";

interface FloatingFieldProps {
  id: string;
  name: string;
  label: string;
  type?: string;
  required?: boolean;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  accent?: "cyan" | "magenta" | "purple" | "orange";
}

const accentMap: Record<string, string> = {
  cyan: "from-cyan/60 to-cyan/0",
  magenta: "from-magenta/60 to-magenta/0",
  purple: "from-purple/60 to-purple/0",
  orange: "from-orange/60 to-orange/0",
};

const FloatingField = ({ id, name, label, type = "text", required, value, onChange, accent = "cyan" }: FloatingFieldProps) => {
  const [focused, setFocused] = useState(false);
  const active = focused || value.length > 0;

  return (
    <div className="relative group">
      <input
        id={id}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        required={required}
        autoComplete="off"
        className={cn(
          "peer w-full h-12 px-4 pt-4 pb-1 rounded-xl border bg-background/40 backdrop-blur-sm",
          "text-sm sm:text-base text-foreground placeholder-transparent",
          "border-border/60 focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/30",
          "transition-all duration-300"
        )}
        placeholder={label}
      />
      <label
        htmlFor={id}
        className={cn(
          "absolute left-4 pointer-events-none transition-all duration-300 origin-left",
          active
            ? "top-1.5 text-[10px] sm:text-xs text-primary scale-95"
            : "top-3.5 text-sm sm:text-base text-muted-foreground"
        )}
      >
        {label}{required && " *"}
      </label>
      <span
        className={cn(
          "pointer-events-none absolute inset-x-3 -bottom-px h-px bg-gradient-to-r transition-all duration-500",
          accentMap[accent],
          focused ? "opacity-100 scale-x-100" : "opacity-0 scale-x-0"
        )}
      />
    </div>
  );
};

const Contact = () => {
  const { data: settings } = useSiteSettings();
  const contactSettings = settings?.contact as Record<string, string> | undefined;

  const contactInfo = [
    { icon: Mail, label: "Email", value: contactSettings?.email || "hello@rastechno.com", color: "cyan" },
    { icon: Phone, label: "Phone", value: contactSettings?.phone || "+1 (555) 123-4567", color: "magenta" },
    { icon: MapPin, label: "Location", value: contactSettings?.address || "San Francisco, CA", color: "purple" },
  ];

  const benefits = [
    contactSettings?.benefit1 || "Proven track record",
    contactSettings?.benefit2 || "Expert team",
    contactSettings?.benefit3 || "Custom solutions",
    contactSettings?.benefit4 || "24/7 support",
  ];

  const { toast } = useToast();
  const submitMessage = useSubmitContactMessage();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [serviceFocused, setServiceFocused] = useState(false);
  const [messageFocused, setMessageFocused] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    service: "",
    message: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await submitMessage.mutateAsync({
        name: formData.name,
        email: formData.email,
        company: formData.company || undefined,
        service: formData.service || undefined,
        message: formData.message,
      });
      setSuccess(true);
      toast({ title: "Message Sent!", description: "We'll get back to you within 24 hours." });
      setFormData({ name: "", email: "", company: "", service: "", message: "" });
      setTimeout(() => setSuccess(false), 3500);
    } catch {
      toast({ title: "Error", description: "Failed to send message. Please try again.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <section id="contact" className="py-16 sm:py-20 md:py-24 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-cyan/5 to-background" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-teal/40 to-transparent" />
        <div className="absolute -top-40 right-0 w-96 h-96 bg-purple/15 rounded-full blur-3xl animate-pulse-glow" />
        <div className="absolute -bottom-40 left-0 w-96 h-96 bg-teal/15 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: "1s" }} />
        <div className="absolute top-1/2 right-1/4 w-[500px] h-[500px] bg-cyan/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-16">
          <p className="text-primary font-semibold mb-2 sm:mb-4 text-sm sm:text-base inline-flex items-center gap-2 justify-center">
            <Sparkles className="w-4 h-4" /> Get in Touch
          </p>
          <h2 className="font-display text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4 sm:mb-6">
            Let's Build Something <span className="text-gradient-aurora">Amazing</span>
          </h2>
          <p className="text-sm sm:text-base md:text-lg text-muted-foreground px-2">
            Ready to transform your ideas into reality? Reach out and let's start a conversation about your next project.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Contact Info */}
          <div className="lg:col-span-2 space-y-6 sm:space-y-8">
            <div>
              <h3 className="font-display text-lg sm:text-xl font-semibold text-foreground mb-4 sm:mb-6">Contact Information</h3>
              <div className="space-y-3 sm:space-y-4">
                {contactInfo.map((item, index) => (
                  <div
                    key={item.label}
                    className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl glass-strong hover-lift hover:border-primary/30 transition-all duration-300 group"
                  >
                    <div className={cn(
                      "w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center transition-transform duration-300 group-hover:scale-110",
                      index === 0 ? "bg-gradient-to-br from-cyan/30 to-cyan/5" :
                      index === 1 ? "bg-gradient-to-br from-magenta/30 to-magenta/5" :
                      "bg-gradient-to-br from-purple/30 to-purple/5"
                    )}>
                      <item.icon className={cn(
                        "w-4 h-4 sm:w-5 sm:h-5",
                        index === 0 ? "text-cyan" : index === 1 ? "text-magenta" : "text-purple"
                      )} />
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm text-muted-foreground">{item.label}</p>
                      <p className="text-sm sm:text-base font-medium text-foreground">{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 sm:p-6 rounded-xl glass-strong">
              <h3 className="font-display text-lg sm:text-xl font-semibold text-foreground mb-3 sm:mb-4">Why Choose RaS Techno?</h3>
              <ul className="space-y-2 sm:space-y-3">
                {benefits.map((benefit, index) => (
                  <li key={benefit} className="flex items-center gap-2 sm:gap-3 text-sm sm:text-base text-muted-foreground">
                    <div className={cn(
                      "w-5 h-5 rounded-full flex items-center justify-center",
                      index === 0 ? "bg-cyan/20" : index === 1 ? "bg-magenta/20" :
                      index === 2 ? "bg-purple/20" : "bg-orange/20"
                    )}>
                      <Check className={cn(
                        "w-3 h-3",
                        index === 0 ? "text-cyan" : index === 1 ? "text-magenta" :
                        index === 2 ? "text-purple" : "text-orange"
                      )} />
                    </div>
                    {benefit}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-3">
            <form
              onSubmit={handleSubmit}
              className="relative p-5 sm:p-7 md:p-9 rounded-2xl glass-strong gradient-border space-y-5 sm:space-y-6 overflow-hidden"
            >
              {/* Animated top accent */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan via-purple to-magenta animate-gradient-shift" style={{ backgroundSize: "200% 100%" }} />

              {/* Success overlay */}
              <div
                className={cn(
                  "absolute inset-0 z-20 flex flex-col items-center justify-center rounded-2xl backdrop-blur-md bg-background/80 transition-all duration-500",
                  success ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
                )}
              >
                <div className="relative">
                  <div className="absolute inset-0 rounded-full bg-cyan/30 blur-2xl animate-pulse-glow" />
                  <CheckCircle2 className="relative w-20 h-20 text-cyan animate-scale-in" strokeWidth={1.5} />
                </div>
                <h3 className="mt-4 font-display text-xl sm:text-2xl font-bold text-gradient-aurora">Message Sent!</h3>
                <p className="text-sm text-muted-foreground mt-1">We'll get back within 24 hours.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                <FloatingField id="name" name="name" label="Full Name" required value={formData.name} onChange={handleChange} accent="cyan" />
                <FloatingField id="email" name="email" type="email" label="Email Address" required value={formData.email} onChange={handleChange} accent="magenta" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                <FloatingField id="company" name="company" label="Company" value={formData.company} onChange={handleChange} accent="purple" />

                <div className="relative">
                  <select
                    id="service"
                    name="service"
                    value={formData.service}
                    onChange={handleChange}
                    onFocus={() => setServiceFocused(true)}
                    onBlur={() => setServiceFocused(false)}
                    className={cn(
                      "peer w-full h-12 px-4 pt-4 pb-1 rounded-xl border bg-background/40 backdrop-blur-sm",
                      "text-sm sm:text-base text-foreground border-border/60",
                      "focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all duration-300"
                    )}
                  >
                    <option value="">Select a service</option>
                    <option value="animation">Animation & Creative Design</option>
                    <option value="software">Software Development</option>
                    <option value="ai">AI & Automation</option>
                    <option value="it">IT Services & Consultancy</option>
                    <option value="data">Data Management & Analytics</option>
                    <option value="digital">Digital Transformation</option>
                  </select>
                  <label
                    htmlFor="service"
                    className={cn(
                      "absolute left-4 pointer-events-none transition-all duration-300",
                      "top-1.5 text-[10px] sm:text-xs text-primary"
                    )}
                  >
                    Service Interested In
                  </label>
                  <span
                    className={cn(
                      "pointer-events-none absolute inset-x-3 -bottom-px h-px bg-gradient-to-r from-orange/60 to-orange/0 transition-all duration-500",
                      serviceFocused ? "opacity-100 scale-x-100" : "opacity-0 scale-x-0"
                    )}
                  />
                </div>
              </div>

              <div className="relative">
                <Textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  onFocus={() => setMessageFocused(true)}
                  onBlur={() => setMessageFocused(false)}
                  required
                  placeholder=" "
                  className={cn(
                    "peer min-h-32 sm:min-h-36 px-4 pt-6 pb-2 rounded-xl bg-background/40 backdrop-blur-sm border-border/60",
                    "focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:border-primary/60 transition-all duration-300"
                  )}
                />
                <label
                  htmlFor="message"
                  className={cn(
                    "absolute left-4 pointer-events-none transition-all duration-300",
                    formData.message || messageFocused
                      ? "top-1.5 text-[10px] sm:text-xs text-primary"
                      : "top-3.5 text-sm sm:text-base text-muted-foreground"
                  )}
                >
                  Tell us about your project... *
                </label>
                <span
                  className={cn(
                    "pointer-events-none absolute inset-x-3 -bottom-px h-px bg-gradient-to-r from-cyan/60 via-purple/60 to-magenta/60 transition-all duration-500",
                    messageFocused ? "opacity-100 scale-x-100" : "opacity-0 scale-x-0"
                  )}
                />
              </div>

              <Button
                type="submit"
                variant="aurora"
                size="lg"
                className="w-full relative overflow-hidden group"
                disabled={isSubmitting || success}
              >
                <span className={cn("inline-flex items-center justify-center gap-2 transition-all", isSubmitting && "opacity-0")}>
                  Send Message
                  <Send className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-0.5 transition-transform" />
                </span>
                {isSubmitting && (
                  <span className="absolute inset-0 flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Sending...
                  </span>
                )}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
