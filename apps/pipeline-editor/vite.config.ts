import { defineConfig } from 'vite'
import { resolve } from 'path'
import vue from '@vitejs/plugin-vue'
import ViteRedirect404Plugin from './vite.redirect'

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    open: './index.html',
    host: '0.0.0.0',
    port: '8080',
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  plugins: [ViteRedirect404Plugin(), vue()],
})
