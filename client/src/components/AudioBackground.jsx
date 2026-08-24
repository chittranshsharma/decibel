import { useEffect, useRef } from "react";

export default function AudioBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
    if (!gl) return;

    let animationFrameId;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Mouse tracking with smooth interpolation
    const mouse = { x: 0.5, y: 0.5, targetX: 0.5, targetY: 0.5, clickPulse: 0 };

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      gl.viewport(0, 0, width, height);
    };

    const handleMouseMove = (e) => {
      mouse.targetX = e.clientX / window.innerWidth;
      mouse.targetY = 1.0 - e.clientY / window.innerHeight;
    };

    const handlePointerDown = () => {
      mouse.clickPulse = 1.0;
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("pointerdown", handlePointerDown);

    // --- Vertex Shader ---
    const vsSource = `
      attribute vec2 position;
      void main() {
        gl_Position = vec4(position, 0.0, 1.0);
      }
    `;

    // --- Mind-Blowing Organic Audio Hologram Fragment Shader ---
    const fsSource = `
      precision highp float;
      uniform vec2 u_resolution;
      uniform vec2 u_mouse;
      uniform float u_time;
      uniform float u_pulse;

      // Simplex-inspired fast 2D rotation
      mat2 rot(float a) {
        float c = cos(a);
        float s = sin(a);
        return mat2(c, -s, s, c);
      }

      // Smooth fractal noise
      float hash(vec2 p) {
        return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
      }

      float noise(vec2 p) {
        vec2 i = floor(p);
        vec2 f = fract(p);
        vec2 u = f * f * (3.0 - 2.0 * f);
        return mix(
          mix(hash(i + vec2(0.0, 0.0)), hash(i + vec2(1.0, 0.0)), u.x),
          mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
          u.y
        );
      }

      // Fractional Brownian Motion with Audio Harmonics
      float fbm(vec2 p) {
        float v = 0.0;
        float a = 0.55;
        vec2 shift = vec2(100.0);
        mat2 rotMatrix = rot(0.5);
        for (int i = 0; i < 5; ++i) {
          v += a * noise(p);
          p = rotMatrix * p * 2.05 + shift;
          a *= 0.48;
        }
        return v;
      }

      void main() {
        vec2 uv = (gl_FragCoord.xy * 2.0 - u_resolution) / min(u_resolution.x, u_resolution.y);
        vec2 mouseUV = (u_mouse * 2.0 - 1.0) * (u_resolution / min(u_resolution.x, u_resolution.y));
        
        float t = u_time * 0.28;

        // Interactive mouse gravity well & ripple
        vec2 toMouse = uv - mouseUV;
        float mouseDist = length(toMouse);
        float mouseRipple = sin(mouseDist * 14.0 - u_time * 3.0) * exp(-mouseDist * 3.5) * (0.15 + u_pulse * 0.35);
        uv += (toMouse / (mouseDist + 0.1)) * mouseRipple;

        // 3D Isometric Holographic Vinyl Distortion
        vec2 p = uv * 1.35;
        p = rot(t * 0.08) * p;

        // Domain Warping Layers (Organic fluid soundwave ribbons)
        vec2 q = vec2(0.0);
        q.x = fbm(p + vec2(0.0, t * 0.2));
        q.y = fbm(p + vec2(1.0, -t * 0.15));

        vec2 r = vec2(0.0);
        r.x = fbm(p + 1.8 * q + vec2(1.7, 9.2) + 0.15 * t);
        r.y = fbm(p + 1.8 * q + vec2(8.3, 2.8) + 0.126 * t);

        float f = fbm(p + 2.2 * r);

        // Soundwave Equalizer Oscillations (Concentric resonance)
        float d = length(uv);
        float rings = sin(d * 18.0 - t * 2.2 + f * 5.0);
        float sharpRings = smoothstep(0.7, 0.98, rings) * (1.0 - smoothstep(0.0, 2.2, d));

        // Ultra-Curated Bespoke Color Palette: Deep Obsidian, Iridescent Mint, Ultra-Violet & Neon Cyan
        vec3 bgVoid = vec3(0.031, 0.031, 0.047); // Pure Obsidian Studio #08080c
        vec3 colMint = vec3(0.314, 0.890, 0.761); // Jam Mint #50e3c2
        vec3 colCyan = vec3(0.0, 0.875, 0.847);   // Electric Cyan #00dfd8
        vec3 colViolet = vec3(0.475, 0.157, 0.792); // Deep Violet #7928ca
        vec3 colMagenta = vec3(1.0, 0.0, 0.502); // Neon Magenta #ff0080

        // Blend layers through chromatic frequency spectrum
        vec3 color = bgVoid;
        
        // Fluid nebula blend
        color = mix(color, colViolet, clamp(f * f * 3.2, 0.0, 1.0) * 0.55);
        color = mix(color, colMint, clamp(length(q) * 1.2, 0.0, 1.0) * 0.45);
        color = mix(color, colCyan, clamp(length(r.x) * 1.4, 0.0, 1.0) * 0.4);
        
        // Add glowing resonant ring accents
        color += colMint * sharpRings * 0.35;
        color += colMagenta * pow(clamp(f * r.y * 2.2, 0.0, 1.0), 3.0) * 0.6;

        // Subtle chromatic vignette
        float vignette = smoothstep(2.0, 0.4, length(uv * 0.85));
        color *= vignette;

        // Tone map for deep rich obsidian contrast
        color = pow(color, vec3(1.15));

        gl_FragColor = vec4(color, 1.0);
      }
    `;

    // Compile helper
    function createShader(gl, type, source) {
      const shader = gl.createShader(type);
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error(gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    }

    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vsSource);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fsSource);
    if (!vertexShader || !fragmentShader) return;

    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error(gl.getProgramInfoLog(program));
      return;
    }

    gl.useProgram(program);

    // Quad geometry
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW
    );

    const positionLocation = gl.getAttribLocation(program, "position");
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    // Uniform locations
    const resLocation = gl.getUniformLocation(program, "u_resolution");
    const mouseLocation = gl.getUniformLocation(program, "u_mouse");
    const timeLocation = gl.getUniformLocation(program, "u_time");
    const pulseLocation = gl.getUniformLocation(program, "u_pulse");

    let startTime = performance.now();

    const render = () => {
      const now = performance.now();
      const elapsed = (now - startTime) * 0.001;

      // Mouse smoothing
      mouse.x += (mouse.targetX - mouse.x) * 0.06;
      mouse.y += (mouse.targetY - mouse.y) * 0.06;
      mouse.clickPulse *= 0.94; // Decay pulse

      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(resLocation, canvas.width, canvas.height);
      gl.uniform2f(mouseLocation, mouse.x, mouse.y);
      gl.uniform1f(timeLocation, elapsed);
      gl.uniform1f(pulseLocation, mouse.clickPulse);

      gl.drawArrays(gl.TRIANGLES, 0, 6);
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("pointerdown", handlePointerDown);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* 60FPS Reactive Holographic WebGL Audio Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

      {/* Tactile Analog Noise Grain Texture Overlay */}
      <div className="noise-overlay" />

      {/* Subtle Studio Top Vignette */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#08080c]/60 pointer-events-none" />
    </div>
  );
}
