import { useEffect, useState, useRef } from "react";
import { useSiteSettings } from "@/hooks/useSiteSettings";

const AnimatedCounter = ({ end, suffix, color, duration = 2000 }: { end: number; suffix: string; color: string; duration?: number }) => {
  const [count, setCount] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          let startTime: number;
          const animate = (timestamp: number) => {
            if (!startTime) startTime = timestamp;
            const progress = Math.min((timestamp - startTime) / duration, 1);
            setCount(Math.floor(progress * end));
            if (progress < 1) {
              requestAnimationFrame(animate);
            }
          };
          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.3 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [end, duration, hasAnimated]);

  return (
    <div 
      ref={ref} 
      className={`font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold ${
        color === "cyan" ? "text-cyan" :
        color === "magenta" ? "text-magenta" :
        color === "purple" ? "text-purple" : "text-orange"
      }`}
      style={{ textShadow: `0 0 30px hsl(var(--${color}) / 0.4)` }}
    >
      {count}{suffix}
    </div>
  );
};

const Stats = () => {
  const { data: settings } = useSiteSettings();
  const statsSettings = settings?.stats as Record<string, string> | undefined;

  const stats = [
    { 
      value: parseInt(statsSettings?.projectsDelivered || "150"), 
      suffix: "+", 
      label: statsSettings?.projectsLabel || "Projects Delivered", 
      color: "cyan" 
    },
    { 
      value: parseInt(statsSettings?.happyClients || "75"), 
      suffix: "+", 
      label: statsSettings?.clientsLabel || "Happy Clients", 
      color: "magenta" 
    },
    { 
      value: parseInt(statsSettings?.itSolutions || "50"), 
      suffix: "+", 
      label: statsSettings?.solutionsLabel || "IT Solutions", 
      color: "purple" 
    },
    { 
      value: parseInt(statsSettings?.successRate || "98"), 
      suffix: "%", 
      label: statsSettings?.successLabel || "Success Rate", 
      color: "orange" 
    },
  ];

  const sectionTitle = statsSettings?.sectionTitle || "Our Impact in";
  const sectionSubtitle = statsSettings?.sectionSubtitle || "Excellence delivered across multiple projects and industries";

  return (
    <section className="py-12 sm:py-16 md:py-20 relative overflow-hidden">
      {/* Enhanced background with gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-cyan/5 via-teal/5 to-green/5" />
      <div className="absolute inset-0 bg-gradient-to-b from-background/50 via-transparent to-background/50" />
      
      {/* Floating gradient orbs */}
      <div className="absolute -top-20 left-1/4 w-64 h-64 bg-cyan/10 rounded-full blur-3xl animate-pulse-glow" />
      <div className="absolute -bottom-20 right-1/4 w-64 h-64 bg-green/10 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: "1s" }} />
      
      {/* Decorative gradient lines */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan/40 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-teal/40 to-transparent" />
      
      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="font-display text-xl sm:text-2xl md:text-3xl font-bold text-foreground">
            {sectionTitle} <span className="text-gradient-primary">Numbers</span>
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground mt-2">{sectionSubtitle}</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8 lg:gap-12">
          {stats.map((stat, index) => (
            <div
              key={stat.label}
              className="text-center p-4 sm:p-6 rounded-2xl glass animate-fade-in relative overflow-hidden group"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Gradient border effect */}
              <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${
                stat.color === "cyan" ? "bg-gradient-to-br from-cyan/10 to-transparent" :
                stat.color === "magenta" ? "bg-gradient-to-br from-magenta/10 to-transparent" :
                stat.color === "purple" ? "bg-gradient-to-br from-purple/10 to-transparent" :
                "bg-gradient-to-br from-orange/10 to-transparent"
              }`} />
              
              <div className="relative z-10">
                <AnimatedCounter end={stat.value} suffix={stat.suffix} color={stat.color} />
                <p className="text-xs sm:text-sm md:text-base text-muted-foreground mt-1 sm:mt-2 font-medium">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Stats;
