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
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    let width = window.innerWidth;
    let height = window.innerHeight;

    const updateSize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    updateSize();

    const mouse = {
      x: width * 0.5,
      y: height * 0.4,
      targetX: width * 0.5,
      targetY: height * 0.4,
      active: false,
    };

    let resizeTimer;
    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(updateSize, 100);
    };

    const handleMouseMove = (e) => {
      mouse.targetX = e.clientX;
      mouse.targetY = e.clientY;
      mouse.active = true;
    };

    const handleMouseLeave = () => {
      mouse.active = false;
    };

    const handleTouchMove = (e) => {
      if (e.touches && e.touches[0]) {
        mouse.targetX = e.touches[0].clientX;
        mouse.targetY = e.touches[0].clientY;
        mouse.active = true;
      }
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    window.addEventListener("mouseleave", handleMouseLeave);


    let phase = 0;
    let isVisible = !document.hidden;

    const handleVisibilityChange = () => {
      isVisible = !document.hidden;
      if (isVisible) {
        animId = requestAnimationFrame(render);
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Harmonic Audio Wave Definitions (Elevated arcade glow)
    const waves = [
      { freq: 0.0028, speed: 0.014, amp: 44, yOffset: 0.30, color: "rgba(245, 166, 35, 0.22)", width: 2.0 },
      { freq: 0.0042, speed: 0.018, amp: 58, yOffset: 0.38, color: "rgba(255, 200, 100, 0.18)", width: 1.6 },
      { freq: 0.0019, speed: 0.011, amp: 38, yOffset: 0.46, color: "rgba(180, 80, 255, 0.16)", width: 1.8 },
      { freq: 0.0035, speed: 0.016, amp: 52, yOffset: 0.54, color: "rgba(245, 166, 35, 0.18)", width: 1.5 },
      { freq: 0.0022, speed: 0.013, amp: 64, yOffset: 0.62, color: "rgba(255, 180, 60, 0.14)", width: 1.8 },
      { freq: 0.0048, speed: 0.020, amp: 42, yOffset: 0.70, color: "rgba(255, 255, 255, 0.10)", width: 1.2 },
    ];

    const EQ_BARS = 40;

    const render = () => {
      if (!isVisible) return;

      phase += 0.9;
      mouse.x += (mouse.targetX - mouse.x) * 0.06;
      mouse.y += (mouse.targetY - mouse.y) * 0.06;

      ctx.clearRect(0, 0, width, height);

      // 1. Deep Obsidian Studio Base with Warm Spotlight Center
      const bgGrad = ctx.createRadialGradient(
        mouse.x,
        mouse.y,
        60,
        width * 0.5,
        height * 0.45,
        Math.max(width, height) * 0.8
      );
      bgGrad.addColorStop(0, "rgba(28, 20, 42, 0.92)");
      bgGrad.addColorStop(0.45, "rgba(12, 10, 18, 0.96)");
      bgGrad.addColorStop(1, "rgba(5, 4, 8, 1)");
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // 2. Subtle Isometric Studio Audio Grid
      ctx.strokeStyle = "rgba(255, 255, 255, 0.035)";
      ctx.lineWidth = 1;
      const gridSize = 56;
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
          const distToMouse = Math.hypot(x - mouse.x, baseLineY - mouse.y);
          const mouseDisp = mouse.active
            ? Math.sin(distToMouse * 0.03 - phase * 0.06) * Math.max(0, 42 - distToMouse * 0.07)
            : 0;

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

      // 4. Glowing Bottom Audio Spectrum Equalizer
      const barWidth = width / EQ_BARS;
      for (let i = 0; i < EQ_BARS; i++) {
        const barX = i * barWidth;
        const waveFactor = Math.sin(phase * 0.035 + i * 0.32) * Math.cos(phase * 0.025 - i * 0.18);
        const barH = Math.max(8, Math.abs(waveFactor) * (height * 0.14));

        const barGrad = ctx.createLinearGradient(0, height - barH, 0, height);
        barGrad.addColorStop(0, "rgba(245, 166, 35, 0.22)");
        barGrad.addColorStop(0.5, "rgba(245, 166, 35, 0.08)");
        barGrad.addColorStop(1, "rgba(245, 166, 35, 0.01)");

        ctx.fillStyle = barGrad;
        ctx.fillRect(barX + 2, height - barH, barWidth - 4, barH);
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      clearTimeout(resizeTimer);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-0 pointer-events-none w-full h-full"
      style={{ opacity: 1.0 }}
    />
  );
}
