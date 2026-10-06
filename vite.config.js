import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  resolve: { dedupe: ["react", "react-dom"] },
  // pre-bundle deps used by lazy pages so Vite doesn't re-optimize (and reload) mid-session
  optimizeDeps: {
    include: ["react", "react-dom", "react-router-dom", "primereact/editor", "quill", "leaflet", "qrcode.react", "sweetalert2", "framer-motion"],
  },
});
