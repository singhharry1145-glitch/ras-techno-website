import { useEffect, useRef } from "react";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import NetworkBackground from "@/components/effects/NetworkBackground";

const TITLE = "RaS Techno";

// Convert hex/rgb computed style to relative luminance
const luminance = (rgb: string) => {
  const m = rgb.match(/rgba?\(([^)]+)\)/);
  if (!m) return 1;
  const [r, g, b] = m[1].split(",").slice(0, 3).map((v) => parseFloat(v) / 255);
  const ch = (c: number) =>
    c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  return 0.2126 * ch(r) + 0.7152 * ch(g) + 0.0722 * ch(b);
};

const Hero = () => {
  const titleRef = useRef<HTMLHeadingElement>(null);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  // Pointer-driven 3D glow + nearest-word highlight
  useEffect(() => {
    const el = titleRef.current;
    if (!el) return;
    const handle = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const x = e.clientX - r.left;
      const y = e.clientY - r.top;
      const cx = r.width / 2;
      const cy = r.height / 2;
      el.style.setProperty("--rx", `${((y - cy) / cy) * -6}deg`);
      el.style.setProperty("--ry", `${((x - cx) / cx) * 8}deg`);
      el.style.setProperty("--mx", `${(x / r.width) * 100}%`);
      el.style.setProperty("--my", `${(y / r.height) * 100}%`);
      // Nearest word highlight
      const words = el.querySelectorAll<HTMLElement>(".hero-word");
      let best: HTMLElement | null = null;
      let bestDist = Infinity;
      words.forEach((w) => {
        const wr = w.getBoundingClientRect();
        const wx = wr.left + wr.width / 2 - r.left;
        const wy = wr.top + wr.height / 2 - r.top;
        const d = Math.hypot(wx - x, wy - y);
        if (d < bestDist) {
          bestDist = d;
          best = w;
        }
      });
      words.forEach((w) => w.classList.toggle("is-active", w === best));
    };
    const reset = () => {
      el.style.setProperty("--rx", "0deg");
      el.style.setProperty("--ry", "0deg");
      el.querySelectorAll(".hero-word.is-active").forEach((w) =>
        w.classList.remove("is-active")
      );
    };
    el.addEventListener("pointermove", handle);
    el.addEventListener("pointerleave", reset);
    return () => {
      el.removeEventListener("pointermove", handle);
      el.removeEventListener("pointerleave", reset);
    };
  }, []);

  // Auto contrast check — if hero text contrast vs background is below WCAG AA,
  // add a "hero-boost" class that swaps gradient text for solid foreground.
  useEffect(() => {
    const check = () => {
      const el = titleRef.current;
      if (!el) return;
      const bg = getComputedStyle(document.body).backgroundColor;
      // Use the foreground swatch as the proxy for resolved gradient text color
      const probe = document.createElement("span");
      probe.style.color = "hsl(var(--foreground))";
      probe.style.position = "absolute";
      probe.style.opacity = "0";
      el.appendChild(probe);
      const fg = getComputedStyle(probe).color;
      el.removeChild(probe);
      const lBg = luminance(bg);
      const lFg = luminance(fg);
      const ratio = (Math.max(lBg, lFg) + 0.05) / (Math.min(lBg, lFg) + 0.05);
      el.classList.toggle("hero-boost", ratio < 4.5);
    };
    check();
    const obs = new MutationObserver(check);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    window.addEventListener("resize", check);
    return () => {
      obs.disconnect();
      window.removeEventListener("resize", check);
    };
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden aurora-bg noise">
      <NetworkBackground />

      <div className="absolute inset-0 grid-pattern opacity-40 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-transparent to-background pointer-events-none" />

      <div className="container mx-auto px-4 sm:px-6 pt-16 sm:pt-20 relative z-10">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-strong mb-6 sm:mb-8 animate-fade-in border border-primary/30">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs sm:text-sm font-medium tracking-wide">Innovation Meets Creativity</span>
          </div>

          <h1
            ref={titleRef}
            className="hero-title font-display text-4xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-black mb-6 leading-[0.95] animate-fade-in-up"
            style={{ animationDelay: "0.1s" }}
            aria-label={TITLE}
          >
            <span className="text-gradient-aurora hero-title-text">
              {TITLE.split(" ").map((word, i) => (
                <span key={i} className="hero-word">
                  {word}
                  {i < TITLE.split(" ").length - 1 ? " " : ""}
                </span>
              ))}
            </span>
          </h1>

          <p className="text-lg sm:text-2xl md:text-3xl font-semibold text-foreground mb-3 sm:mb-4 animate-fade-in-up" style={{ animationDelay: "0.25s" }}>
            Animating Ideas. <span className="text-gradient-primary">Engineering Solutions.</span>
          </p>

          <p className="text-sm sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8 sm:mb-12 px-2 animate-fade-in-up" style={{ animationDelay: "0.4s" }}>
            Your partner in blending artistry with technology. We transform ideas into stunning animations and deliver cutting-edge IT solutions.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 animate-fade-in-up" style={{ animationDelay: "0.55s" }}>
            <Button variant="aurora" size="lg" className="group w-full sm:w-auto" onClick={() => scrollTo('work')}>
              Explore Our Work
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button variant="ghost" size="lg" className="w-full sm:w-auto text-muted-foreground hover:text-foreground" onClick={() => scrollTo('contact')}>
              Get in Touch →
            </Button>
          </div>

          <div className="hidden sm:flex flex-col items-center gap-2 mt-16 animate-fade-in" style={{ animationDelay: "0.9s" }}>
            <span className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Scroll</span>
            <div className="w-6 h-10 rounded-full border-2 border-muted-foreground/40 flex items-start justify-center pt-2">
              <span className="w-1 h-2 rounded-full bg-primary animate-scroll-bounce" />
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent pointer-events-none" />
    </section>
  );
};

export default Hero;
