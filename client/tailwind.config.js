/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        // Vercel Geist + Cyberpunk Audiophile Palette
        void: "#000000", // Stark Vercel black canvas
        surface: "#0a0a0c", // Deep surface
        cabinet: "#111114", // Elevated card surface
        "cabinet-hover": "#17171c",
        rule: "#23232a", // 1px hairline border
        "rule-light": "#33333f",
        bone: "#ededed", // Pure Geist high-emphasis ink/text
        dim: "#888888", // Geist body/mute
        faint: "#555555",
        
        // Vercel Accent Trio & Multi-Stop Mesh Colors
        "vercel-blue": "#0070f3",
        "vercel-cyan": "#50e3c2",
        "vercel-violet": "#7928ca",
        "vercel-pink": "#ff0080",
        "vercel-amber": "#f5a623",
        
        // Game Highlights
        amber: "#f5a623",
        pink: "#ff0080",
        cyan: "#00dfd8",
        purple: "#7928ca",
        yellow: "#f9cb28",
        good: "#3df07a", // Correct reveal / success
        bad: "#ee0000", // Error / wrong guess
      },
      fontFamily: {
        geist: ["Geist", "sans-serif"],
        geistmono: ['"Geist Mono"', "monospace"],
        marquee: ["Geist", "Archivo", "system-ui", "sans-serif"],
        console: ['"Geist Mono"', '"Space Mono"', "ui-monospace", "monospace"],
        coin: ['"Press Start 2P"', "ui-monospace", "monospace"],
      },
      borderRadius: {
        sm: "6px",
        md: "12px",
        lg: "16px",
        "pill-cat": "64px",
        pill: "100px",
      },
      keyframes: {
        blink: { "50%": { opacity: "0" } },
        flicker: {
          "0%,97%": { opacity: "1" },
          "98%": { opacity: ".82" },
          "100%": { opacity: "1" },
        },
        scoreroll: {
          from: { transform: "translateY(0.4em)", opacity: "0" },
          to: { transform: "none", opacity: "1" },
        },
        rise: {
          from: { transform: "translateY(8px)", opacity: "0" },
          to: { transform: "none", opacity: "1" },
        },
        floatup: {
          "0%": { transform: "translateY(0) scale(.8)", opacity: "0" },
          "15%": { transform: "translateY(-10px) scale(1)", opacity: "1" },
          "100%": { transform: "translateY(-120px) scale(1)", opacity: "0" },
        },
        popin: {
          from: { transform: "scale(.25)", opacity: "0", filter: "blur(4px)" },
          to: { transform: "scale(1)", opacity: "1", filter: "blur(0px)" },
        },
        lockin: {
          "0%": { transform: "scale(1)" },
          "35%": { transform: "scale(.97)" },
          "100%": { transform: "scale(1)" },
        },
        digitpop: {
          from: { transform: "scale(1.25)", opacity: "0" },
          to: { transform: "scale(1)", opacity: "1" },
        },
        beat: {
          "0%, 100%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.04)" },
        },
        moveHorizontal: {
          "0%": { transform: "translateX(-50%) translateY(-10%)" },
          "50%": { transform: "translateX(50%) translateY(10%)" },
          "100%": { transform: "translateX(-50%) translateY(-10%)" },
        },
        moveInCircle: {
          "0%": { transform: "rotate(0deg)" },
          "50%": { transform: "rotate(180deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        moveVertical: {
          "0%": { transform: "translateY(-50%)" },
          "50%": { transform: "translateY(50%)" },
          "100%": { transform: "translateY(-50%)" },
        },
      },
      animation: {
        blink: "blink 1s step-end infinite",
        flicker: "flicker 4s steps(1) infinite",
        scoreroll: "scoreroll 240ms cubic-bezier(.16,1,.3,1) both",
        rise: "rise 240ms cubic-bezier(.16,1,.3,1) both",
        floatup: "floatup 1.6s ease-out forwards",
        popin: "popin 300ms cubic-bezier(0.2,0,0,1) both",
        lockin: "lockin 220ms cubic-bezier(.16,1,.3,1) both",
        digitpop: "digitpop 260ms cubic-bezier(0.2,0,0,1) both",
        beat: "beat 1s ease-in-out infinite",
        first: "moveVertical 30s ease infinite",
        second: "moveInCircle 20s reverse infinite",
        third: "moveInCircle 40s linear infinite",
        fourth: "moveHorizontal 40s ease infinite",
        fifth: "moveInCircle 20s ease infinite",
      },
    },
  },
  plugins: [],
};
