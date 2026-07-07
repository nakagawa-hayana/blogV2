import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  compatibilityDate: '2025-07-24',
  devtools: { enabled: true },
  modules: ['@nuxtjs/google-fonts'],
  css: ['~/assets/css/tailwind.css', 'katex/dist/katex.min.css'],
  vite: {
    plugins: [tailwindcss()],
  },
  googleFonts: {
    families: {
      'Zen Maru Gothic': [500, 700],
      'Zen Kaku Gothic New': [400, 500, 700],
      'DM Mono': [400, 500],
    },
    display: 'swap',
    download: false,
  },
  runtimeConfig: {
    authToken: process.env.TOKEN || '',
    backendUrl: process.env.BACKEND_URL || 'http://localhost:8787',
    public: {
      publishUrl: process.env.PUBLISH_URL || 'http://localhost:3000',
      siteName: 'ardririyの足跡',
      siteDescription: 'ardririyのブログ',
    },
  },
  nitro: {
    preset: process.env.NITRO_PRESET || 'node-server',
    routeRules: {
      '/og/**': { headers: { 'Cache-Control': 'public, max-age=3600, s-maxage=86400' } },
      '/sitemap.xml': { headers: { 'Cache-Control': 'public, max-age=3600, s-maxage=86400' } },
      '/robots.txt': { headers: { 'Cache-Control': 'public, max-age=86400' } },
    },
  },
  app: {
    head: {
      htmlAttrs: { lang: 'ja' },
      link: [
        { rel: 'icon', href: '/favicon.ico' },
      ],
      meta: [
        { name: 'robots', content: 'index, follow' },
      ],
    },
  },
  typescript: {
    strict: true,
    typeCheck: false,
  },
})
