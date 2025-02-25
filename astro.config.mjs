// @ts-check
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import react from "@astrojs/react";
import vercel from "@astrojs/vercel";
import sitemap from "@astrojs/sitemap";

export default defineConfig({
  site: "https://rei.gg",

  trailingSlash: "never",

  vite: {
    plugins: [tailwindcss()],
    server: {
      allowedHosts: ["a61b-76-68-188-65.ngrok-free.app"],
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

  adapter: vercel(),
  output: "server",
  devToolbar: {
    enabled: false,
  },
});
