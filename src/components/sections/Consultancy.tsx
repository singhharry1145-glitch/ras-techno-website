import { Calendar, ArrowRight, Users, Clock, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSiteSettings } from "@/hooks/useSiteSettings";

const Consultancy = () => {
  const { data: settings } = useSiteSettings();
  
  const consultancySettings = settings?.consultancy as Record<string, string> | undefined;
  
  const features = [
    {
      icon: Users,
      title: consultancySettings?.feature1Title || "Expert Consultation",
      description: consultancySettings?.feature1Desc || "Get personalized advice from our experienced tech professionals",
    },
    {
      icon: Clock,
      title: consultancySettings?.feature2Title || "Flexible Scheduling",
      description: consultancySettings?.feature2Desc || "Book appointments at your convenience with our easy scheduling system",
    },
    {
      icon: CheckCircle,
      title: consultancySettings?.feature3Title || "Tailored Solutions",
      description: consultancySettings?.feature3Desc || "Receive customized recommendations for your specific business needs",
    },
  ];

  const appointmentUrl = consultancySettings?.appointmentUrl || "https://rastechnoappointment.netlify.app/";
  const title = consultancySettings?.title || "Schedule Your";
  const subtitle = consultancySettings?.subtitle || "Take the first step towards transforming your business. Book a consultation with our technology experts and discover how we can help you achieve your goals.";
  const cardTitle = consultancySettings?.cardTitle || "Free Initial Consultation";
  const cardSubtitle = consultancySettings?.cardSubtitle || "Discuss your project requirements with our experts at no cost";
  const sessionDuration = consultancySettings?.sessionDuration || "30+";
  const availableDays = consultancySettings?.availableDays || "Monday to Friday";
  const availableTime = consultancySettings?.availableTime || "9 AM - 6 PM";

  const handleBookAppointment = () => {
    window.open(appointmentUrl, "_blank");
  };

  return (
    <section id="consultancy" className="py-16 sm:py-20 md:py-24 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-purple/5 to-background" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple/40 to-transparent" />
        <div className="absolute -top-40 left-1/4 w-96 h-96 bg-cyan/10 rounded-full blur-3xl animate-pulse-glow" />
        <div className="absolute -bottom-40 right-1/4 w-96 h-96 bg-magenta/10 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: "1.5s" }} />
      </div>

      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-6">
            <div>
              <p className="text-primary font-semibold mb-2 sm:mb-4 text-sm sm:text-base">
                Professional Consultancy
              </p>
              <h2 className="font-display text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4 sm:mb-6">
                {title} <span className="text-gradient-primary">Expert Consultation</span>
              </h2>
              <p className="text-sm sm:text-base md:text-lg text-muted-foreground">
                {subtitle}
              </p>
            </div>

            <div className="space-y-4">
              {features.map((feature, index) => (
                <div
                  key={feature.title}
                  className="flex items-start gap-4 p-4 rounded-xl glass hover:border-primary/20 transition-all duration-300"
                >
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center shrink-0 ${
                    index === 0 ? "bg-gradient-to-br from-cyan/20 to-cyan/5" :
                    index === 1 ? "bg-gradient-to-br from-purple/20 to-purple/5" :
                    "bg-gradient-to-br from-magenta/20 to-magenta/5"
                  }`}>
                    <feature.icon className={`w-5 h-5 ${
                      index === 0 ? "text-cyan" : index === 1 ? "text-purple" : "text-magenta"
                    }`} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>

            <Button 
              onClick={handleBookAppointment}
              variant="gradient" 
              size="lg" 
              className="group"
            >
              <Calendar className="w-5 h-5 mr-2" />
              Book Appointment
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>

          {/* Right Content - Visual Card */}
          <div className="relative">
            <div className="p-8 rounded-2xl glass relative overflow-hidden">
              {/* Gradient accent */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan via-purple to-magenta" />
              
              <div className="text-center space-y-6">
                <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                  <Calendar className="w-10 h-10 text-primary" />
                </div>
                
                <div>
                  <h3 className="font-display text-xl sm:text-2xl font-bold text-foreground mb-2">
                    {cardTitle}
                  </h3>
                  <p className="text-muted-foreground">
                    {cardSubtitle}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4">
                  <div className="p-4 rounded-xl bg-muted/50">
                    <div className="text-2xl font-bold text-primary">{sessionDuration}</div>
                    <div className="text-sm text-muted-foreground">Minutes Session</div>
                  </div>
                  <div className="p-4 rounded-xl bg-muted/50">
                    <div className="text-2xl font-bold text-primary">100%</div>
                    <div className="text-sm text-muted-foreground">Free Consultation</div>
                  </div>
                </div>

                <div className="pt-4 border-t border-border">
                  <p className="text-sm text-muted-foreground mb-4">
                    Available {availableDays}, {availableTime}
                  </p>
                  <Button 
                    onClick={handleBookAppointment}
                    variant="outline" 
                    className="w-full"
                  >
                    Schedule Now
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Decorative elements */}
            <div className="absolute -z-10 -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-cyan/30 to-transparent rounded-full blur-2xl" />
            <div className="absolute -z-10 -bottom-4 -left-4 w-32 h-32 bg-gradient-to-br from-purple/30 to-transparent rounded-full blur-2xl" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Consultancy;
