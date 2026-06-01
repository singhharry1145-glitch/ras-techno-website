import { ArrowRight, Sparkles, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";

const CTABlock = () => {
  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section
      id="cta"
      aria-labelledby="cta-heading"
      className="container mx-auto px-4 sm:px-6 py-16 sm:py-24"
    >
      <div className="cta-block max-w-5xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-6 border border-primary/30">
          <Sparkles className="w-3.5 h-3.5 text-primary" aria-hidden />
          <span className="text-xs sm:text-sm font-medium tracking-wide text-foreground">
            Let's build something great
          </span>
        </div>

        <h2
          id="cta-heading"
          className="font-display text-3xl sm:text-5xl md:text-6xl font-black mb-4 text-foreground"
        >
          Ready to <span className="text-gradient-aurora">elevate your idea?</span>
        </h2>

        <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
          Tell us about your project and we’ll get back within one business day —
          no forms-in-a-funnel, just a real conversation.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
          <Button
            variant="aurora"
            size="lg"
            className="group w-full sm:w-auto"
            onClick={() => scrollTo("contact")}
          >
            Start a Conversation
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="w-full sm:w-auto"
            onClick={() => scrollTo("services")}
          >
            <Mail className="w-4 h-4 mr-2" aria-hidden />
            Explore Services
          </Button>
        </div>
      </div>
    </section>
  );
};

export default CTABlock;
