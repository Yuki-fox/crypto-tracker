export default defineNuxtConfig({
  compatibilityDate: '2025-07-28',
  devtools: { enabled: false },
  modules: ['@vueuse/nuxt'],
  css: ['~/assets/main.css'],
  ssr: false,
  app: {
    head: {
      link: [
        { 
          rel: 'stylesheet', 
          href: 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css' 
        }
      ]
    }
  },
  runtimeConfig: {
    jwtSecret: process.env.JWT_SECRET || 'your-secret-key',
    public: {
      binanceApiUrl: 'https://api.binance.com'
    }
  },
  nitro: {
    preset: 'node-server',
    serveStatic: true
  }
})