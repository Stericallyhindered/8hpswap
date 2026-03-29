import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  // GitHub Pages project site: https://<user>.github.io/8hpswap/ — set BASE_PATH=/8hpswap/ in CI
  base: process.env.BASE_PATH ?? "/",
  plugins: [react()],
});
