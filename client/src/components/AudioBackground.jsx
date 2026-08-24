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

    let mouse = { x: width * 0.5, y: height * 0.3, targetX: width * 0.5, targetY: height * 0.3 };

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    const handleMouseMove = (e) => {
      mouse.targetX = e.clientX;
      mouse.targetY = e.clientY;
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("mousemove", handleMouseMove);

    // Audio frequency ribbon layers
    const waves = [
      { color: "rgba(80, 227, 194, 0.12)", speed: 0.015, freq: 0.003, amp: 55, yBase: 0.28, phase: 0 },
      { color: "rgba(121, 40, 202, 0.10)", speed: 0.012, freq: 0.002, amp: 75, yBase: 0.42, phase: 1.5 },
      { color: "rgba(0, 223, 216, 0.09)", speed: 0.018, freq: 0.0025, amp: 45, yBase: 0.58, phase: 3.0 },
      { color: "rgba(255, 0, 128, 0.07)", speed: 0.009, freq: 0.0018, amp: 65, yBase: 0.72, phase: 4.5 },
    ];

    // Constellation sound nodes
    const nodeCount = Math.min(36, Math.floor(width / 35));
    const nodes = Array.from({ length: nodeCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      radius: Math.random() * 2 + 1,
      glow: Math.random() * 0.5 + 0.3,
    }));

    // Floating Vinyl Horizon Rings
    let angle = 0;
    let time = 0;

    const render = () => {
      time += 1;
      angle += 0.002;

      // Smooth mouse easing
      mouse.x += (mouse.targetX - mouse.x) * 0.05;
      mouse.y += (mouse.targetY - mouse.y) * 0.05;

      ctx.clearRect(0, 0, width, height);

      // 1. Draw 3D Vinyl Horizon Radial Rings with subtle mouse tilt
      const horizonX = width * 0.5 + (mouse.x - width * 0.5) * 0.08;
      const horizonY = height * 0.35 + (mouse.y - height * 0.35) * 0.08;

      ctx.save();
      ctx.translate(horizonX, horizonY);
      ctx.scale(1, 0.42); // Isometric ellipse perspective

      for (let r = 120; r < Math.max(width, height) * 1.1; r += 90) {
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(80, 227, 194, ${Math.max(0.012, 0.04 - (r / (width * 1.2)) * 0.035)})`;
        ctx.lineWidth = 1.2;
        ctx.stroke();
      }

      // Radial Vinyl Track Markers
      for (let a = 0; a < Math.PI * 2; a += Math.PI / 4) {
        const lineAngle = a + angle;
        const x1 = Math.cos(lineAngle) * 140;
        const y1 = Math.sin(lineAngle) * 140;
        const x2 = Math.cos(lineAngle) * (Math.max(width, height) * 0.6);
        const y2 = Math.sin(lineAngle) * (Math.max(width, height) * 0.6);

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.strokeStyle = "rgba(255, 255, 255, 0.018)";
        ctx.lineWidth = 1;
        ctx.stroke();
      }
      ctx.restore();

      // 2. Draw Interactive Fluid Audio Frequency Ribbons
      waves.forEach((w, idx) => {
        ctx.beginPath();
        const baseHeight = height * w.yBase;
        
        // Dynamic mouse proximity disturbance
        const mouseDistY = (mouse.y - baseHeight) * 0.12;

        for (let x = 0; x <= width; x += 16) {
          const mouseDistX = Math.max(0, 1 - Math.abs(x - mouse.x) / 320);
          const interactiveAmp = w.amp + mouseDistX * 35;

          const y =
            baseHeight +
            Math.sin(x * w.freq + time * w.speed + w.phase) * interactiveAmp +
            Math.cos(x * (w.freq * 0.6) - time * (w.speed * 0.7)) * (interactiveAmp * 0.4) +
            mouseDistX * mouseDistY;

          if (x === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }

        ctx.strokeStyle = w.color;
        ctx.lineWidth = idx === 0 ? 2 : 1.5;
        ctx.stroke();
      });

      // 3. Draw Sound Node Constellation with Harmonic Links
      for (let i = 0; i < nodes.length; i++) {
        const p1 = nodes[i];
        p1.x += p1.vx;
        p1.y += p1.vy;

        if (p1.x < 0) p1.x = width;
        if (p1.x > width) p1.x = 0;
        if (p1.y < 0) p1.y = height;
        if (p1.y > height) p1.y = 0;

        // Draw node
        ctx.fillStyle = `rgba(80, 227, 194, ${p1.glow * 0.5})`;
        ctx.beginPath();
        ctx.arc(p1.x, p1.y, p1.radius, 0, Math.PI * 2);
        ctx.fill();

        // Connect nearby nodes
        for (let j = i + 1; j < nodes.length; j++) {
          const p2 = nodes[j];
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 130) {
            ctx.strokeStyle = `rgba(80, 227, 194, ${0.08 * (1 - dist / 130)})`;
            ctx.lineWidth = 0.8;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* Interactive Soundscape Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full opacity-90" />

      {/* Tactile Analog Noise Grain Texture */}
      <div className="noise-overlay" />

      {/* Soft Ambient Horizon Glow */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[450px] pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 50% 15%, rgba(80, 227, 194, 0.07) 0%, rgba(121, 40, 202, 0.04) 45%, transparent 75%)",
        }}
      />
    </div>
  );
}
