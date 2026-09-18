import tailwindcss from '@tailwindcss/vite'
export default defineNuxtConfig({
  compatibilityDate: '2026-09-17',
  modules: ['@nuxt/eslint'],
  css: ['~/assets/css/main.css'],
  vite: { plugins: [tailwindcss()] },
  typescript: { strict: true },
  runtimeConfig: {
    supabaseUrl: '',
    supabaseAnonKey: '',
    whatsappNumber: '',
    ticketmasterApiKey: '',
  },
  app: {
    head: {
      title: 'Jastipudu — Lebih dekat dengan panggung',
      htmlAttrs: { lang: 'id' },
      meta: [
        {
          name: 'description',
          content: 'Jasa titip tiket konser dengan biaya transparan dan tracking pesanan.',
        },
      ],
    },
  },
})
