import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,jpg,mp3,otf}']
      },
      includeAssets: [
        'pomogranate.ico',
        'click-sound.mp3',
        'mission-pass-sound.mp3',
        'palm-trees-bg.jpg',
        'time-running-out-sound.mp3',
        'pricedown/pricedown.otf'
      ],
      manifest: {
        name: 'Pomogranate',
        short_name: 'Pomo',
        description: 'Pomogranate is a GTA VC themed pomodoro application that works offline',
        theme_color: '#1976d2',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/',
        icons: [
          {
            src: 'logo192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'logo512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ]
})
