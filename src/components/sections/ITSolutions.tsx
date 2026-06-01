import { useRef, useState, useEffect } from "react";
import { useItSolutions } from "@/hooks/useItSolutions";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { ChevronLeft, ChevronRight, ExternalLink, Monitor } from "lucide-react";
import * as LucideIcons from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const getIcon = (iconName: string | null) => {
  if (!iconName) return Monitor;
  const Icon = (LucideIcons as any)[iconName];
  return Icon || Monitor;
};

const ITSolutions = () => {
  const { data: solutions = [] } = useItSolutions();
  const { data: siteSettings } = useSiteSettings();
  const activeSolutions = solutions.filter((s) => s.is_active);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showAll, setShowAll] = useState(false);
  const isPausedRef = useRef(false);
  const autoScrollRef = useRef<number | null>(null);

  // Check admin setting for auto-scroll (default: enabled)
  const itSolutionsSettings = siteSettings?.it_solutions_scroller as Record<string, unknown> | undefined;
  const autoScrollEnabled = itSolutionsSettings?.enabled !== false;

  useEffect(() => {
    if (!autoScrollEnabled || activeSolutions.length === 0) return;
    
    let animationId: number;
    let lastTime = 0;
    
    const step = (time: number) => {
      if (time - lastTime >= 80) {
        lastTime = time;
        if (scrollRef.current && !isPausedRef.current) {
          const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
          if (scrollLeft + clientWidth >= scrollWidth - 10) {
            scrollRef.current.scrollTo({ left: 0, behavior: "smooth" });
          } else {
            scrollRef.current.scrollLeft += 1;
          }
        }
      }
      animationId = requestAnimationFrame(step);
    };
    
    animationId = requestAnimationFrame(step);
    
    return () => cancelAnimationFrame(animationId);
  }, [autoScrollEnabled, activeSolutions.length]);

  const handlePause = () => { isPausedRef.current = true; };
  const handleResume = () => { isPausedRef.current = false; };

  const scroll = (dir: "left" | "right") => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: dir === "left" ? -320 : 320, behavior: "smooth" });
    }
  };

  if (activeSolutions.length === 0) return null;

  return (
    <section id="it-solutions" className="py-16 sm:py-20 md:py-24 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
        <div className="absolute -top-40 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        {/* Header with counter */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14">
          <p className="text-primary font-semibold mb-2 text-sm sm:text-base">IT Solutions</p>
          <h2 className="font-display text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Our <span className="text-gradient-primary">IT Solutions</span>
          </h2>
          <button
            onClick={() => setShowAll(true)}
            className="inline-flex items-center gap-2 mt-2 px-6 py-3 rounded-full glass border border-primary/20 hover:border-primary/50 transition-all group"
          >
            <span className="text-3xl sm:text-4xl font-display font-bold text-primary">
              {activeSolutions.length}
            </span>
            <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
              Solutions Available — View All
            </span>
          </button>
        </div>

        {/* Scroller */}
        <div className="relative">
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-card/80 backdrop-blur border border-border shadow-lg hidden sm:flex"
            onClick={() => scroll("left")}
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>

          <div
            ref={scrollRef}
            onMouseEnter={handlePause}
            onMouseLeave={handleResume}
            onTouchStart={handlePause}
            onTouchEnd={handleResume}
            className="flex gap-4 sm:gap-6 overflow-x-auto scrollbar-hide px-2 sm:px-10 pb-4 snap-x snap-mandatory"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {activeSolutions.map((solution, i) => {
              const Icon = getIcon(solution.icon);
              return (
                <div
                  key={solution.id}
                  className="min-w-[260px] sm:min-w-[300px] max-w-[320px] flex-shrink-0 snap-center p-5 sm:p-6 rounded-xl glass border border-border/50 hover:border-primary/30 transition-all duration-300 group animate-fade-in"
                  style={{ animationDelay: `${i * 0.05}s` }}
                >
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary/50 flex items-center justify-center mb-4 shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform">
                    <Icon className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <h3 className="font-display font-bold text-foreground text-lg mb-2">{solution.title}</h3>
                  {solution.description && (
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-3">{solution.description}</p>
                  )}
                  {solution.learn_more_url && (
                    <a
                      href={solution.learn_more_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-sm text-primary hover:text-primary/80 font-medium transition-colors"
                    >
                      Learn More <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              );
            })}
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-card/80 backdrop-blur border border-border shadow-lg hidden sm:flex"
            onClick={() => scroll("right")}
          >
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* All Solutions Modal */}
      <Dialog open={showAll} onOpenChange={setShowAll}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-display">
              All IT Solutions ({activeSolutions.length})
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 mt-4">
            {activeSolutions.map((solution) => {
              const Icon = getIcon(solution.icon);
              return (
                <div key={solution.id} className="flex items-start gap-4 p-4 rounded-lg border border-border">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-primary/50 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-foreground">{solution.title}</h4>
                    {solution.description && (
                      <p className="text-sm text-muted-foreground mt-1">{solution.description}</p>
                    )}
                    {solution.learn_more_url && (
                      <a
                        href={solution.learn_more_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-sm text-primary mt-2 hover:underline"
                      >
                        Learn More <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default ITSolutions;
