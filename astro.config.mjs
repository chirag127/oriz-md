// @ts-check
import { defineConfig } from 'astro/config'
import react from '@astrojs/react'
import sitemap from '@astrojs/sitemap'
import VitePWA from '@vite-pwa/astro'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  site: 'https://md.oriz.in',
  output: 'static',
  integrations: [
    react(),
    sitemap(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      includeAssets: ['favicon.svg', 'robots.txt', 'icons/*.png', 'icons/*.svg'],
      manifest: {
        name: 'oriz Markdown',
        short_name: 'Markdown',
        id: '/',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        orientation: 'any',
        background_color: '#f3f5f2',
        theme_color: '#4a7c6f',
        description: 'Split-screen zen Markdown studio: live GFM preview, syntax highlighting, auto TOC, HTML export and print-to-PDF. 100% in your browser.',
        categories: ['productivity'],
        lang: 'en',
        dir: 'ltr',
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: '/icons/icon-256.png', sizes: '256x256', type: 'image/png', purpose: 'any' },
          { src: '/icons/icon-384.png', sizes: '384x384', type: 'image/png', purpose: 'any' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: '/icons/maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
          { src: '/icons/icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
        ],
        screenshots: [
          { src: '/screenshots/desktop.png', sizes: '1280x800', type: 'image/png', form_factor: 'wide', label: 'oriz Markdown studio on desktop' },
          { src: '/screenshots/mobile.png', sizes: '390x844', type: 'image/png', label: 'oriz Markdown studio on mobile' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico,webmanifest,woff2}'],
        navigateFallback: '/',
        runtimeCaching: [
          {
            urlPattern: ({ url }) => /(?:g4f|pollinations|deepinfra|puter)/i.test(url.hostname),
            handler: 'NetworkFirst',
            options: {
              cacheName: 'oz-ai-calls',
              networkTimeoutSeconds: 10,
              expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
      devOptions: { enabled: false },
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
})
