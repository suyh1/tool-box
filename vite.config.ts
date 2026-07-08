import path from 'node:path'
import tailwindcss from '@tailwindcss/vite'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vitest/config'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: './',
  test: {
    environment: 'jsdom',
    include: ['src/**/*.test.ts'],
  },
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      onwarn(warning, warn) {
        if (
          warning.code === 'INVALID_ANNOTATION' &&
          warning.id?.includes('@vueuse/core')
        ) {
          return
        }

        warn(warning)
      },
    },
  },
  plugins: [
    vue(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg'],
      manifest: {
        name: 'Developer Toolbox',
        short_name: 'Toolbox',
        description: 'A local-first developer toolbox for common encoding, parsing, and formatting tasks.',
        lang: 'zh-CN',
        theme_color: '#08090c',
        background_color: '#08090c',
        display: 'standalone',
        start_url: '.',
        icons: [],
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
