import { useEffect, useRef } from "react";

export default function AudioBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animationFrameId;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener("resize", handleResize);

    // Audio Wave Spectrum Nodes
    let time = 0;
    const lines = [
      { color: "rgba(80, 227, 194, 0.07)", speed: 0.008, freq: 0.002, amp: 45, yOffset: 0.35 },
      { color: "rgba(121, 40, 202, 0.06)", speed: 0.006, freq: 0.003, amp: 65, yOffset: 0.5 },
      { color: "rgba(0, 223, 216, 0.05)", speed: 0.011, freq: 0.0015, amp: 35, yOffset: 0.65 },
      { color: "rgba(255, 255, 255, 0.02)", speed: 0.004, freq: 0.004, amp: 25, yOffset: 0.8 },
    ];

    // Subtle ambient particle floating dots
    const particles = Array.from({ length: 28 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 1.5 + 0.5,
      speedY: Math.random() * 0.3 + 0.1,
      opacity: Math.random() * 0.3 + 0.1,
    }));

    const render = () => {
      time += 1;
      ctx.clearRect(0, 0, width, height);

      // Draw faint vinyl groove concentric curves in the background
      const centerX = width * 0.85;
      const centerY = height * 0.2;
      ctx.lineWidth = 1;
      for (let r = 80; r < Math.max(width, height) * 0.9; r += 70) {
        ctx.strokeStyle = "rgba(255, 255, 255, 0.015)";
        ctx.beginPath();
        ctx.arc(centerX, centerY, r, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Draw flowing sine frequency wave ribbons
      for (const line of lines) {
        ctx.beginPath();
        ctx.strokeStyle = line.color;
        ctx.lineWidth = 1.5;

        const baseHeight = height * line.yOffset;
        for (let x = 0; x <= width; x += 12) {
          const y =
            baseHeight +
            Math.sin(x * line.freq + time * line.speed) * line.amp +
            Math.cos(x * (line.freq * 0.5) - time * (line.speed * 0.8)) * (line.amp * 0.4);

          if (x === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.stroke();
      }

      // Draw floating frequency dust
      for (const p of particles) {
        p.y -= p.speedY;
        if (p.y < 0) {
          p.y = height;
          p.x = Math.random() * width;
        }

        ctx.fillStyle = `rgba(80, 227, 194, ${p.opacity * 0.4})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* Deep Obsidian Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full opacity-80" />
      
      {/* Precision Studio Hairline Grid Overlay */}
      <div 
        className="absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage: `
            linear-gradient(to right, #ffffff 1px, transparent 1px),
            linear-gradient(to bottom, #ffffff 1px, transparent 1px)
          `,
          backgroundSize: "64px 64px"
        }}
      />

      {/* Subtle Top Hardware Spotlight */}
      <div 
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[350px] pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at 50% 0%, rgba(80, 227, 194, 0.08) 0%, transparent 70%)"
        }}
      />
    </div>
  );
}
