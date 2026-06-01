import { useEffect, useRef } from "react";

/**
 * Global futuristic 3D moving objects layer.
 * Pure CSS 3D transforms — no WebGL, low cost.
 * Subtle parallax on scroll + mouse for depth.
 */
const Floating3DObjects = () => {
  const layerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = layerRef.current;
    if (!el) return;
    let mx = 0, my = 0, sy = 0, raf = 0;

    const onMove = (e: PointerEvent) => {
      mx = (e.clientX / window.innerWidth - 0.5) * 2;
      my = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    const onScroll = () => { sy = window.scrollY; };

    const tick = () => {
      el.style.setProperty("--mx", mx.toFixed(3));
      el.style.setProperty("--my", my.toFixed(3));
      el.style.setProperty("--sy", `${sy * 0.05}px`);
      raf = requestAnimationFrame(tick);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  const shapes = [
    { type: "cube", top: "8%",  left: "6%",  size: 80,  color: "cyan",    dur: 22, delay: 0 },
    { type: "ring", top: "22%", left: "88%", size: 120, color: "purple",  dur: 28, delay: 2 },
    { type: "pyr",  top: "55%", left: "3%",  size: 70,  color: "magenta", dur: 24, delay: 1 },
    { type: "orb",  top: "70%", left: "92%", size: 90,  color: "teal",    dur: 18, delay: 3 },
    { type: "cube", top: "120%",left: "75%", size: 100, color: "purple",  dur: 26, delay: 0 },
    { type: "ring", top: "150%",left: "10%", size: 140, color: "cyan",    dur: 30, delay: 4 },
    { type: "pyr",  top: "190%",left: "85%", size: 80,  color: "orange",  dur: 22, delay: 2 },
    { type: "orb",  top: "230%",left: "8%",  size: 110, color: "magenta", dur: 20, delay: 1 },
    { type: "cube", top: "270%",left: "90%", size: 90,  color: "teal",    dur: 24, delay: 3 },
    { type: "ring", top: "310%",left: "5%",  size: 130, color: "purple",  dur: 28, delay: 0 },
  ];

  return (
    <div
      ref={layerRef}
      aria-hidden
      className="floating-3d-layer pointer-events-none fixed inset-0 overflow-hidden"
      style={{ zIndex: 1, perspective: "1200px" }}
    >
      {shapes.map((s, i) => (
        <div
          key={i}
          className={`f3d f3d-${s.type}`}
          style={{
            top: s.top,
            left: s.left,
            width: s.size,
            height: s.size,
            // @ts-expect-error css var
            "--c": `hsl(var(--${s.color}))`,
            animationDuration: `${s.dur}s`,
            animationDelay: `${s.delay}s`,
          }}
        >
          <div className="f3d-inner">
            {s.type === "cube" && (
              <>
                <span className="face f-front" />
                <span className="face f-back" />
                <span className="face f-right" />
                <span className="face f-left" />
                <span className="face f-top" />
                <span className="face f-bottom" />
              </>
            )}
            {s.type === "pyr" && (
              <>
                <span className="pface p1" />
                <span className="pface p2" />
                <span className="pface p3" />
                <span className="pface p4" />
              </>
            )}
            {s.type === "ring" && (
              <>
                <span className="ring-band r1" />
                <span className="ring-band r2" />
                <span className="ring-band r3" />
              </>
            )}
            {s.type === "orb" && <span className="orb-core" />}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Floating3DObjects;
