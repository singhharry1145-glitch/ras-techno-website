import { useEffect } from "react";

/**
 * Global 3D scroll-reveal.
 * Auto-tags h1/h2/h3 + [data-reveal] elements and toggles `.is-revealed`
 * when they enter the viewport. Re-scans on route changes via MutationObserver.
 */
export const useScrollReveal = () => {
  useEffect(() => {
    const SELECTOR = "h2, h3, [data-reveal]";
    const REVEAL_CLASS = "scroll-reveal-3d";
    const ON_CLASS = "is-revealed";

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add(ON_CLASS);
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -10% 0px" }
    );

    const tag = (el: Element) => {
      if (el.classList.contains(REVEAL_CLASS)) return;
      // Skip nav/footer chrome to avoid hiding critical UI on first paint
      if (el.closest("nav, header, footer, [data-no-reveal]")) return;
      el.classList.add(REVEAL_CLASS);
      io.observe(el);
    };

    const scan = (root: ParentNode = document) => {
      root.querySelectorAll(SELECTOR).forEach(tag);
    };

    scan();

    const mo = new MutationObserver((muts) => {
      muts.forEach((m) => {
        m.addedNodes.forEach((n) => {
          if (n.nodeType !== 1) return;
          const el = n as Element;
          if (el.matches?.(SELECTOR)) tag(el);
          scan(el);
        });
      });
    });
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      io.disconnect();
      mo.disconnect();
    };
  }, []);
};
