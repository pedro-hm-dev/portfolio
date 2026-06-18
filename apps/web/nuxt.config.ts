// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",

  devtools: { enabled: true },

  css: ["~/assets/css/main.css"],

  modules: [
    "@nuxt/ui",
    "@nuxt/image",
    "@nuxt/fonts",
    "@pinia/nuxt",
    "@vueuse/nuxt",
    "@nuxtjs/i18n",
    "@nuxtjs/mdc",
    "@nuxtjs/sitemap",
    "nuxt-og-image",
  ],

  // Dark/light enabled (the team boilerplate ships colorMode off).
  ui: {
    theme: {
      colors: ["primary", "secondary", "info", "success", "warning", "error"],
    },
  },

  i18n: {
    defaultLocale: "pt",
    strategy: "prefix_except_default",
    // Absolute base for hreflang / canonical alternate links emitted by useLocaleHead.
    baseUrl: process.env.SITE_URL ?? "http://localhost:3000",
    locales: [
      { code: "pt", language: "pt-BR", name: "Português", file: "pt.json" },
      { code: "en", language: "en-US", name: "English", file: "en.json" },
    ],
    bundle: { optimizeTranslationDirective: false },
  },

  site: {
    url: process.env.SITE_URL ?? "http://localhost:3000",
    name: "Pedro Maciel — Portfolio",
  },

  // Static routes get locale variants automatically (i18n integration); dynamic
  // content routes (projects/blog slugs) come from the source endpoint below.
  sitemap: {
    sources: ["/api/__sitemap__/urls"],
  },

  runtimeConfig: {
    public: {
      apiBase: process.env.API_BASE ?? "http://localhost:3001",
    },
  },

  app: {
    head: {
      charset: "utf-8",
      viewport: "width=device-width, initial-scale=1",
    },
  },
});
