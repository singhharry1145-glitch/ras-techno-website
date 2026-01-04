import { useEffect, useRef } from "react";

interface Node {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  pulsePhase: number;
  color: string;
}

const AIBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const nodesRef = useRef<Node[]>([]);
  const animationRef = useRef<number>(0);
  const mouseRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const colors = [
      { h: 175, s: 80, l: 50 }, // cyan
      { h: 280, s: 80, l: 50 }, // purple
      { h: 320, s: 80, l: 50 }, // magenta
      { h: 160, s: 70, l: 45 }, // teal
    ];

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = document.documentElement.scrollHeight;
      initNodes();
    };

    const initNodes = () => {
      const nodeCount = Math.floor((canvas.width * canvas.height) / 12000);
      nodesRef.current = Array.from({ length: Math.min(nodeCount, 120) }, () => {
        const color = colors[Math.floor(Math.random() * colors.length)];
        return {
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.4,
          vy: (Math.random() - 0.5) * 0.4,
          radius: Math.random() * 2.5 + 1.5,
          pulsePhase: Math.random() * Math.PI * 2,
          color: `${color.h}, ${color.s}%, ${color.l}%`,
        };
      });
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY + window.scrollY };
    };

    const handleScroll = () => {
      canvas.height = document.documentElement.scrollHeight;
    };

    const animate = () => {
      ctx.fillStyle = "rgba(10, 10, 15, 0.08)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const nodes = nodesRef.current;
      const time = Date.now() * 0.001;

      // Draw hexagonal grid pattern
      ctx.strokeStyle = "hsla(175, 80%, 50%, 0.03)";
      ctx.lineWidth = 1;
      const hexSize = 60;
      for (let y = 0; y < canvas.height; y += hexSize * 1.5) {
        for (let x = 0; x < canvas.width; x += hexSize * 1.73) {
          const offsetX = (Math.floor(y / (hexSize * 1.5)) % 2) * (hexSize * 0.866);
          drawHexagon(ctx, x + offsetX, y, hexSize / 2);
        }
      }

      // Update and draw nodes
      nodes.forEach((node, i) => {
        // Update position
        node.x += node.vx;
        node.y += node.vy;

        // Wrap around edges
        if (node.x < 0) node.x = canvas.width;
        if (node.x > canvas.width) node.x = 0;
        if (node.y < 0) node.y = canvas.height;
        if (node.y > canvas.height) node.y = 0;

        // Pulse effect
        const pulse = Math.sin(time * 2 + node.pulsePhase) * 0.5 + 0.5;
        const radius = node.radius * (1 + pulse * 0.4);

        // Outer glow
        const gradient = ctx.createRadialGradient(
          node.x, node.y, 0,
          node.x, node.y, radius * 6
        );
        gradient.addColorStop(0, `hsla(${node.color}, ${0.9 + pulse * 0.1})`);
        gradient.addColorStop(0.3, `hsla(${node.color}, ${0.4 * pulse})`);
        gradient.addColorStop(0.6, `hsla(${node.color}, ${0.1 * pulse})`);
        gradient.addColorStop(1, "transparent");

        ctx.beginPath();
        ctx.arc(node.x, node.y, radius * 6, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();

        // Core node with brighter center
        ctx.beginPath();
        ctx.arc(node.x, node.y, radius, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${node.color}, 1)`;
        ctx.fill();

        // Draw connections
        nodes.forEach((other, j) => {
          if (i >= j) return;
          const dx = other.x - node.x;
          const dy = other.y - node.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          const maxDistance = 200;

          if (distance < maxDistance) {
            const opacity = (1 - distance / maxDistance) * 0.6;
            
            // Data flow effect
            const flowProgress = (time * 0.5 + i * 0.1) % 1;
            const flowX = node.x + dx * flowProgress;
            const flowY = node.y + dy * flowProgress;

            // Connection line with gradient
            ctx.beginPath();
            ctx.moveTo(node.x, node.y);
            ctx.lineTo(other.x, other.y);
            const lineGradient = ctx.createLinearGradient(node.x, node.y, other.x, other.y);
            lineGradient.addColorStop(0, `hsla(${node.color}, ${opacity})`);
            lineGradient.addColorStop(0.5, `hsla(280, 80%, 50%, ${opacity * 0.8})`);
            lineGradient.addColorStop(1, `hsla(${other.color}, ${opacity})`);
            ctx.strokeStyle = lineGradient;
            ctx.lineWidth = 1.5;
            ctx.stroke();

            // Data packet with glow
            if (distance > 60) {
              ctx.beginPath();
              ctx.arc(flowX, flowY, 3, 0, Math.PI * 2);
              ctx.fillStyle = `hsla(175, 90%, 70%, ${opacity * 1.8})`;
              ctx.fill();
              
              // Packet glow
              const packetGlow = ctx.createRadialGradient(flowX, flowY, 0, flowX, flowY, 8);
              packetGlow.addColorStop(0, `hsla(175, 90%, 70%, ${opacity})`);
              packetGlow.addColorStop(1, "transparent");
              ctx.beginPath();
              ctx.arc(flowX, flowY, 8, 0, Math.PI * 2);
              ctx.fillStyle = packetGlow;
              ctx.fill();
            }
          }
        });
      });

      // Draw enhanced circuit patterns
      drawCircuitPatterns(ctx, canvas.width, canvas.height, time);

      // Mouse interaction glow
      const mouseGradient = ctx.createRadialGradient(
        mouseRef.current.x, mouseRef.current.y, 0,
        mouseRef.current.x, mouseRef.current.y, 250
      );
      mouseGradient.addColorStop(0, "hsla(175, 80%, 50%, 0.15)");
      mouseGradient.addColorStop(0.5, "hsla(280, 80%, 50%, 0.05)");
      mouseGradient.addColorStop(1, "transparent");
      ctx.fillStyle = mouseGradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      animationRef.current = requestAnimationFrame(animate);
    };

    const drawHexagon = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number) => {
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i - Math.PI / 6;
        const hx = x + size * Math.cos(angle);
        const hy = y + size * Math.sin(angle);
        if (i === 0) ctx.moveTo(hx, hy);
        else ctx.lineTo(hx, hy);
      }
      ctx.closePath();
      ctx.stroke();
    };

    const drawCircuitPatterns = (
      ctx: CanvasRenderingContext2D,
      width: number,
      height: number,
      time: number
    ) => {
      ctx.lineWidth = 1;

      // Horizontal circuits with glow
      for (let y = 150; y < height; y += 250) {
        const offset = Math.sin(time * 0.2 + y * 0.01) * 50;
        
        // Glow layer
        ctx.strokeStyle = "hsla(175, 80%, 50%, 0.08)";
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(0, y + offset);
        for (let x = 0; x < width; x += 80) {
          const yOffset = Math.sin(x * 0.02 + time) * 25;
          ctx.lineTo(x, y + offset + yOffset);
        }
        ctx.stroke();

        // Main line
        ctx.strokeStyle = "hsla(175, 80%, 50%, 0.06)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, y + offset);
        for (let x = 0; x < width; x += 80) {
          const yOffset = Math.sin(x * 0.02 + time) * 25;
          ctx.lineTo(x, y + offset + yOffset);
        }
        ctx.stroke();
      }

      // Vertical circuits with glow
      for (let x = 150; x < width; x += 250) {
        const offset = Math.cos(time * 0.15 + x * 0.01) * 30;
        
        ctx.strokeStyle = "hsla(280, 80%, 50%, 0.06)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x + offset, 0);
        for (let y = 0; y < height; y += 80) {
          const xOffset = Math.cos(y * 0.02 + time) * 20;
          ctx.lineTo(x + offset + xOffset, y);
        }
        ctx.stroke();
      }
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    window.addEventListener("scroll", handleScroll);
    window.addEventListener("mousemove", handleMouseMove);
    animate();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(animationRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ opacity: 0.85 }}
    />
  );
};

export default AIBackground;