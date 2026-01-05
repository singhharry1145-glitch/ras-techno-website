import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import NetworkBackground from "@/components/effects/NetworkBackground";

const Hero = () => {
  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Network constellation background */}
      <NetworkBackground />
      
      {/* Background Glow Effects */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Main gradient orbs */}
        <div className="absolute top-1/4 left-1/4 w-48 sm:w-72 md:w-96 h-48 sm:h-72 md:h-96 bg-cyan/20 rounded-full blur-3xl animate-pulse-glow" />
        <div className="absolute bottom-1/4 right-1/4 w-48 sm:w-72 md:w-96 h-48 sm:h-72 md:h-96 bg-green/15 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: "1.5s" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 sm:w-96 md:w-[600px] h-72 sm:h-96 md:h-[600px] bg-purple/10 rounded-full blur-3xl" />
        {/* Additional gradient orbs */}
        <div className="absolute top-1/3 right-1/3 w-32 sm:w-48 h-32 sm:h-48 bg-teal/15 rounded-full blur-2xl animate-pulse-glow" style={{ animationDelay: "2s" }} />
        <div className="absolute bottom-1/3 left-1/4 w-40 sm:w-56 h-40 sm:h-56 bg-coral/10 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: "3s" }} />
      </div>

      {/* Gradient mesh overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-transparent to-background pointer-events-none" />

      <div className="container mx-auto px-4 sm:px-6 pt-16 sm:pt-20 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full glass mb-4 sm:mb-6 animate-fade-in border border-coral/30">
            <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-coral" />
            <span className="text-xs sm:text-sm font-medium text-coral">Innovation Meets Creativity</span>
          </div>

          {/* Main Heading */}
          <h1 className="font-display text-3xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold mb-4 sm:mb-6 animate-fade-in" style={{ animationDelay: "0.1s" }}>
            <span className="text-gradient-primary text-glow-cyan">RaS Techno</span>
          </h1>

          {/* Tagline */}
          <p className="text-base sm:text-xl md:text-2xl lg:text-3xl font-medium text-foreground mb-3 sm:mb-4 animate-fade-in" style={{ animationDelay: "0.2s" }}>
            Animating Ideas. Engineering Solutions.
          </p>

          {/* Description */}
          <p className="text-sm sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-6 sm:mb-10 px-2 animate-fade-in" style={{ animationDelay: "0.3s" }}>
            Your partner in blending artistry with technology. We transform ideas into stunning animations and deliver cutting-edge IT solutions.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 animate-fade-in" style={{ animationDelay: "0.4s" }}>
            <Button variant="gradient" size="lg" className="group w-full sm:w-auto" onClick={() => scrollTo('work')}>
              Explore Our Work
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button variant="glass" size="lg" className="w-full sm:w-auto border-secondary/30 hover:border-secondary/50" onClick={() => scrollTo('contact')}>
              Get in Touch
            </Button>
          </div>
        </div>
      </div>

      {/* Bottom Gradient Fade */}
      <div className="absolute bottom-0 left-0 right-0 h-24 sm:h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
};

export default Hero;
