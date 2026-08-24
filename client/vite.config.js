import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Dev server proxies Socket.IO traffic to the game server on :3000 so the
// client can use a same-origin connection (no CORS, no hardcoded host).
export default defineConfig({
  plugins: [react()],
  resolve: {
    dedupe: ["react", "react-dom"],
    alias: {
      react: path.resolve(__dirname, "node_modules/react"),
      "react-dom": path.resolve(__dirname, "node_modules/react-dom"),
    },
  },
  server: {
    port: 5173,
    strictPort: true,
    proxy: {
      "/socket.io": {
        target: "http://localhost:3000",
        ws: true, // required: the client uses the websocket transport
        changeOrigin: true,
      },
    },
  },
});

