import { ReactNode, useRef, PointerEvent } from "react";

interface Tilt3DProps {
  children: ReactNode;
  className?: string;
  max?: number; // max tilt degrees
  scale?: number;
  glare?: boolean;
  style?: React.CSSProperties;
}

/**
 * Lightweight 3D mouse-parallax wrapper.
 * Theme-aware glare via currentColor token.
 */
const Tilt3D = ({ children, className = "", max = 12, scale = 1.02, glare = true, style }: Tilt3DProps) => {
  const ref = useRef<HTMLDivElement>(null);

  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    const rx = (0.5 - py) * max * 2;
    const ry = (px - 0.5) * max * 2;
    el.style.setProperty("--rx", `${rx}deg`);
    el.style.setProperty("--ry", `${ry}deg`);
    el.style.setProperty("--gx", `${px * 100}%`);
    el.style.setProperty("--gy", `${py * 100}%`);
    el.style.setProperty("--sc", `${scale}`);
  };

  const onLeave = () => {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty("--rx", `0deg`);
    el.style.setProperty("--ry", `0deg`);
    el.style.setProperty("--sc", `1`);
  };

  return (
    <div
      ref={ref}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      className={`tilt-3d ${className}`}
      style={style}
    >
      <div className="tilt-3d-inner">
        {children}
        {glare && <span className="tilt-3d-glare" aria-hidden />}
      </div>
    </div>
  );
};

export default Tilt3D;
