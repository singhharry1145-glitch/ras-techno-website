import { Palette, Code, Bot, Settings, Database, Zap, ArrowRight, Shield, Globe, Cpu, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useActiveServices } from "@/hooks/useServices";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Palette,
  Code,
  Bot,
  Settings,
  Database,
  Zap,
  Shield,
  Globe,
  Cpu,
  Layers,
};

const Services = () => {
  const { data: services, isLoading } = useActiveServices();

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="services" className="py-16 sm:py-20 md:py-24 relative overflow-hidden">
      {/* Enhanced gradient background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-cyan/3 to-background" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-teal/40 to-transparent" />
        <div className="absolute -top-20 right-0 w-96 h-96 bg-cyan/10 rounded-full blur-3xl animate-pulse-glow" />
        <div className="absolute -bottom-20 left-0 w-96 h-96 bg-purple/10 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: "1s" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-gradient-to-r from-cyan/5 via-teal/5 to-green/5 rounded-full blur-3xl" />
      </div>
      
      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-16">
          <p className="text-primary font-semibold mb-2 sm:mb-4 text-sm sm:text-base">Our Services</p>
          <h2 className="font-display text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4 sm:mb-6">
            Comprehensive <span className="text-gradient-primary">Solutions</span>
          </h2>
          <p className="text-sm sm:text-base md:text-lg text-muted-foreground px-2">
            From creative design to technical implementation, we offer a full spectrum of services to power your digital success.
          </p>
        </div>

        {/* Services Grid */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {services?.map((service, index) => {
              const IconComponent = iconMap[service.icon] || Settings;
              return (
                <div
                  key={service.id}
                  className="group p-5 sm:p-6 rounded-2xl glass hover:border-primary/30 transition-all duration-500 animate-fade-in flex flex-col relative overflow-hidden"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {/* Gradient overlay on hover */}
                  <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${
                    service.color === "cyan" ? "bg-gradient-to-br from-cyan/5 to-transparent" :
                    service.color === "magenta" ? "bg-gradient-to-br from-magenta/5 to-transparent" :
                    service.color === "purple" ? "bg-gradient-to-br from-purple/5 to-transparent" :
                    "bg-gradient-to-br from-orange/5 to-transparent"
                  }`} />
                  
                  <div className="relative z-10 flex flex-col h-full">
                    <div
                      className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center mb-4 sm:mb-5 transition-all duration-300 group-hover:scale-110 ${
                        service.color === "cyan"
                          ? "bg-gradient-to-br from-cyan/20 to-cyan/5 text-cyan group-hover:shadow-lg group-hover:shadow-cyan/20"
                          : service.color === "magenta"
                          ? "bg-gradient-to-br from-magenta/20 to-magenta/5 text-magenta group-hover:shadow-lg group-hover:shadow-magenta/20"
                          : service.color === "purple"
                          ? "bg-gradient-to-br from-purple/20 to-purple/5 text-purple group-hover:shadow-lg group-hover:shadow-purple/20"
                          : "bg-gradient-to-br from-orange/20 to-orange/5 text-orange group-hover:shadow-lg group-hover:shadow-orange/20"
                      }`}
                    >
                      <IconComponent className="w-6 h-6 sm:w-7 sm:h-7" />
                    </div>
                    
                    <h3 className="font-display text-lg sm:text-xl font-semibold text-foreground mb-2 sm:mb-3">{service.title}</h3>
                    <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-5 flex-grow">{service.description}</p>
                    
                    <ul className="space-y-1.5 sm:space-y-2 mb-4 sm:mb-5">
                      {service.features.map((feature) => (
                        <li key={feature} className="text-xs sm:text-sm text-muted-foreground flex items-center gap-2">
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            service.color === "cyan" ? "bg-cyan" :
                            service.color === "magenta" ? "bg-magenta" :
                            service.color === "purple" ? "bg-purple" : "bg-orange"
                          }`} />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    
                    <Button variant="ghost" className="w-full group/btn mt-auto text-sm sm:text-base" onClick={() => scrollTo('solutions')}>
                      Learn more
                      <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* CTA */}
        <div className="text-center mt-12 sm:mt-16 p-6 sm:p-8 rounded-2xl glass relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan/5 via-purple/5 to-magenta/5" />
          <div className="relative z-10">
            <h3 className="font-display text-lg sm:text-xl md:text-2xl font-semibold text-foreground mb-2 sm:mb-3">
              Don't See What You Need?
            </h3>
            <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6 max-w-lg mx-auto">
              We specialize in custom solutions. Tell us about your challenge, and we'll create a tailored approach to solve it.
            </p>
            <Button variant="gradient" size="lg" onClick={() => scrollTo('contact')}>
              Discuss Your Project
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Services;
