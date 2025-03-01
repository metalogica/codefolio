// @ts-check
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import react from "@astrojs/react";
import vercel from "@astrojs/vercel";
import sitemap from "@astrojs/sitemap";
import mdx from "@astrojs/mdx";
import remarkShikiTwoslash from "remark-shiki-twoslash";

export default defineConfig({
  site: "https://rei.gg",

  trailingSlash: "never",

  vite: {
    plugins: [tailwindcss()],
    server: {
      allowedHosts: [""],
    },
  },

  integrations: [
    mdx({
      remarkPlugins: [
        [
          remarkShikiTwoslash,
          {
            hovers: true,
            themes: ["github-dark"],
          },
        ],
      ],
    }),
    react(),
    sitemap({
      serialize: (item) => {
        const url = item.url.endsWith("/") ? item.url.slice(0, -1) : item.url;
        return { ...item, url };
      },
    }),
  ],

  markdown: {
    shikiConfig: {
      // @ts-ignore - shiki config is not typed
      langs: ["typescript"],
      theme: "github-dark",
      wrap: true,
    },
  },

  adapter: vercel(),
  output: "server",
  devToolbar: {
    enabled: false,
  },
});
