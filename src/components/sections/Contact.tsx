import { useState } from "react";
import { Mail, Phone, MapPin, Check, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useSubmitContactMessage } from "@/hooks/useContactMessages";
import { useSiteSettings } from "@/hooks/useSiteSettings";

const Contact = () => {
  const { data: settings } = useSiteSettings();
  
  // Get contact settings from database with fallbacks
  const contactSettings = settings?.contact as Record<string, string> | undefined;
  
  const contactInfo = [
    { icon: Mail, label: "Email", value: contactSettings?.email || "hello@rastechno.com" },
    { icon: Phone, label: "Phone", value: contactSettings?.phone || "+1 (555) 123-4567" },
    { icon: MapPin, label: "Location", value: contactSettings?.address || "San Francisco, CA" },
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
      
      toast({
        title: "Message Sent!",
        description: "We'll get back to you within 24 hours.",
      });
      
      setFormData({ name: "", email: "", company: "", service: "", message: "" });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <section id="contact" className="py-16 sm:py-20 md:py-24 relative overflow-hidden">
      {/* Enhanced gradient accents */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-cyan/3 to-background" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-teal/40 to-transparent" />
        <div className="absolute -top-40 right-0 w-96 h-96 bg-purple/10 rounded-full blur-3xl animate-pulse-glow" />
        <div className="absolute -bottom-40 left-0 w-96 h-96 bg-teal/10 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: "1s" }} />
        <div className="absolute top-1/2 right-1/4 w-[500px] h-[500px] bg-cyan/5 rounded-full blur-3xl" />
      </div>
      
      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-16">
          <p className="text-primary font-semibold mb-2 sm:mb-4 text-sm sm:text-base">Get in Touch</p>
          <h2 className="font-display text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4 sm:mb-6">
            Let's Build Something <span className="text-gradient-primary">Amazing</span>
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
                    className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl glass hover:border-primary/20 transition-all duration-300"
                  >
                    <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center ${
                      index === 0 ? "bg-gradient-to-br from-cyan/20 to-cyan/5" :
                      index === 1 ? "bg-gradient-to-br from-magenta/20 to-magenta/5" :
                      "bg-gradient-to-br from-purple/20 to-purple/5"
                    }`}>
                      <item.icon className={`w-4 h-4 sm:w-5 sm:h-5 ${
                        index === 0 ? "text-cyan" : index === 1 ? "text-magenta" : "text-purple"
                      }`} />
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm text-muted-foreground">{item.label}</p>
                      <p className="text-sm sm:text-base font-medium text-foreground">{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 sm:p-6 rounded-xl glass">
              <h3 className="font-display text-lg sm:text-xl font-semibold text-foreground mb-3 sm:mb-4">Why Choose RaS Techno?</h3>
              <ul className="space-y-2 sm:space-y-3">
                {benefits.map((benefit, index) => (
                  <li key={benefit} className="flex items-center gap-2 sm:gap-3 text-sm sm:text-base text-muted-foreground">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                      index === 0 ? "bg-cyan/20" : index === 1 ? "bg-magenta/20" : 
                      index === 2 ? "bg-purple/20" : "bg-orange/20"
                    }`}>
                      <Check className={`w-3 h-3 ${
                        index === 0 ? "text-cyan" : index === 1 ? "text-magenta" : 
                        index === 2 ? "text-purple" : "text-orange"
                      }`} />
                    </div>
                    {benefit}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-3">
            <form onSubmit={handleSubmit} className="p-5 sm:p-6 md:p-8 rounded-2xl glass space-y-4 sm:space-y-6 relative overflow-hidden">
              {/* Form gradient accent */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan via-purple to-magenta" />
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <label htmlFor="name" className="block text-xs sm:text-sm font-medium text-foreground mb-1.5 sm:mb-2">
                    Full Name *
                  </label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="John Doe"
                    className="bg-muted/50 text-sm sm:text-base"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-xs sm:text-sm font-medium text-foreground mb-1.5 sm:mb-2">
                    Email Address *
                  </label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="john@example.com"
                    className="bg-muted/50 text-sm sm:text-base"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <label htmlFor="company" className="block text-xs sm:text-sm font-medium text-foreground mb-1.5 sm:mb-2">
                    Company
                  </label>
                  <Input
                    id="company"
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                    placeholder="Your Company"
                    className="bg-muted/50 text-sm sm:text-base"
                  />
                </div>
                <div>
                  <label htmlFor="service" className="block text-xs sm:text-sm font-medium text-foreground mb-1.5 sm:mb-2">
                    Service Interested In
                  </label>
                  <select
                    id="service"
                    name="service"
                    value={formData.service}
                    onChange={handleChange}
                    className="w-full h-10 sm:h-11 px-3 rounded-lg border border-border bg-muted/50 text-sm sm:text-base text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="">Select a service</option>
                    <option value="animation">Animation & Creative Design</option>
                    <option value="software">Software Development</option>
                    <option value="ai">AI & Automation</option>
                    <option value="it">IT Services & Consultancy</option>
                    <option value="data">Data Management & Analytics</option>
                    <option value="digital">Digital Transformation</option>
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="message" className="block text-xs sm:text-sm font-medium text-foreground mb-1.5 sm:mb-2">
                  Message *
                </label>
                <Textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  placeholder="Tell us about your project..."
                  className="bg-muted/50 min-h-24 sm:min-h-32 text-sm sm:text-base"
                />
              </div>

              <Button type="submit" variant="gradient" size="lg" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Sending..." : "Send Message"}
                <Send className="w-4 h-4 ml-2" />
              </Button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
