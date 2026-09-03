// @ts-check
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import react from "@astrojs/react";
import vercel from "@astrojs/vercel";
import sitemap from "@astrojs/sitemap";

export default defineConfig({
  site: "https://rei.gg",

  trailingSlash: "never",

  server: {
    host: true,
  },

  vite: {
    plugins: [tailwindcss()],
    server: {
      allowedHosts: [".ngrok-free.app", ".ngrok.io"],
    },
  },
  integrations: [
    react(),
    sitemap({
      serialize: (item) => {
        const url = item.url.endsWith("/") ? item.url.slice(0, -1) : item.url;
        return { ...item, url };
      },
    }),
  ],

  // includeFiles copies the CV into the serverless bundle so the /cv route
  // (src/pages/cv.ts) can read it at runtime. Without this the route 404s in
  // production even though it works in dev.
  adapter: vercel({ includeFiles: ["./public/cv.pdf"] }),
  output: "server",
  devToolbar: {
    enabled: false,
  },
});
