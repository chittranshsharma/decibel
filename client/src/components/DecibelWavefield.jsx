import { useEffect, useRef } from "react";

/**
 * DecibelWavefield
 * Meaningful, living ambient audio wavefield for DECIBEL music trivia.
 * Features undulating multi-frequency sine harmonics, subtle vinyl groove ripples,
 * and mouse-interactive audio wave dispersion on deep obsidian studio canvas.
 */
export default function DecibelWavefield() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const mouse = {
      x: width * 0.5,
      y: height * 0.4,
      targetX: width * 0.5,
      targetY: height * 0.4,
      active: false,
    };

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    const handleMouseMove = (e) => {
      mouse.targetX = e.clientX;
      mouse.targetY = e.clientY;
      mouse.active = true;
    };

    const handleMouseLeave = () => {
      mouse.active = false;
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseleave", handleMouseLeave);

    let phase = 0;

    // Harmonic Audio Wave Definitions
    const waves = [
      { freq: 0.0028, speed: 0.012, amp: 42, yOffset: 0.32, color: "rgba(245, 166, 35, 0.14)", width: 1.8 },
      { freq: 0.0042, speed: 0.016, amp: 55, yOffset: 0.38, color: "rgba(255, 184, 77, 0.10)", width: 1.4 },
      { freq: 0.0019, speed: 0.009, amp: 35, yOffset: 0.45, color: "rgba(245, 166, 35, 0.12)", width: 1.6 },
      { freq: 0.0035, speed: 0.014, amp: 48, yOffset: 0.52, color: "rgba(255, 255, 255, 0.06)", width: 1.2 },
      { freq: 0.0022, speed: 0.011, amp: 60, yOffset: 0.60, color: "rgba(245, 166, 35, 0.08)", width: 1.5 },
      { freq: 0.0048, speed: 0.018, amp: 38, yOffset: 0.68, color: "rgba(255, 184, 77, 0.07)", width: 1.2 },
    ];

    // Equalizer spectrum columns along the bottom
    const EQ_BARS = 36;

    const render = () => {
      phase += 0.8;
      mouse.x += (mouse.targetX - mouse.x) * 0.05;
      mouse.y += (mouse.targetY - mouse.y) * 0.05;

      ctx.clearRect(0, 0, width, height);

      // 1. Deep Obsidian Studio Base
      const bgGrad = ctx.createRadialGradient(
        mouse.x,
        mouse.y,
        50,
        width * 0.5,
        height * 0.5,
        Math.max(width, height) * 0.85
      );
      bgGrad.addColorStop(0, "rgba(18, 14, 28, 0.85)");
      bgGrad.addColorStop(0.5, "rgba(8, 7, 13, 0.95)");
      bgGrad.addColorStop(1, "rgba(3, 2, 6, 1)");
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // 2. Subtle Isometric Studio Audio Grid
      ctx.strokeStyle = "rgba(255, 255, 255, 0.022)";
      ctx.lineWidth = 1;
      const gridSize = 64;
      ctx.beginPath();
      for (let x = 0; x < width; x += gridSize) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
      }
      ctx.stroke();

      // 3. Multi-Frequency Audio Harmonic Waves
      waves.forEach((w, wIdx) => {
        ctx.beginPath();
        ctx.strokeStyle = w.color;
        ctx.lineWidth = w.width;

        const baseLineY = height * w.yOffset;
        const currentPhase = phase * w.speed + wIdx * 1.4;

        for (let x = 0; x <= width; x += 6) {
          // Interactive mouse wave distortion
          const distToMouse = Math.hypot(x - mouse.x, baseLineY - mouse.y);
          const mouseDisp = mouse.active
            ? Math.sin(distToMouse * 0.03 - phase * 0.05) * Math.max(0, 36 - distToMouse * 0.06)
            : 0;

          // Harmonic multi-sine synthesis
          const primaryWave = Math.sin(x * w.freq + currentPhase) * w.amp;
          const harmonicWave = Math.sin(x * w.freq * 2.2 - currentPhase * 0.7) * (w.amp * 0.35);
          const y = baseLineY + primaryWave + harmonicWave + mouseDisp;

          if (x === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.stroke();
      });

      // 4. Subtle Bottom Audio Spectrum Equalizer
      const barWidth = width / EQ_BARS;
      for (let i = 0; i < EQ_BARS; i++) {
        const barX = i * barWidth;
        const waveFactor = Math.sin(phase * 0.03 + i * 0.35) * Math.cos(phase * 0.02 - i * 0.2);
        const barH = Math.max(6, Math.abs(waveFactor) * (height * 0.12));

        const barGrad = ctx.createLinearGradient(0, height - barH, 0, height);
        barGrad.addColorStop(0, "rgba(245, 166, 35, 0.12)");
        barGrad.addColorStop(1, "rgba(245, 166, 35, 0.01)");

        ctx.fillStyle = barGrad;
        ctx.fillRect(barX + 2, height - barH, barWidth - 4, barH);
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-0 pointer-events-none w-full h-full"
      style={{ opacity: 0.95 }}
    />
  );
}
