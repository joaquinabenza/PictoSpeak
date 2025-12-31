import path from 'path';
const __dirname = path.resolve();
// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  modules: [
    '@nuxt/eslint',
    '@nuxt/hints',
    '@nuxt/image',
    '@nuxt/test-utils',
    '@nuxtjs/tailwindcss'
  ],
  vite: {
    resolve: {
        alias: {
          '@': path.resolve(__dirname, './app'),
        },
      },
    
      // Use relative base path so assets load correctly on GitHub Pages (e.g. /repo-name/)
      base: './',   
  }
})