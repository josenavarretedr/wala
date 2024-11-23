import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'


// https://vite.dev/config/
export default defineConfig({
  // configure Vite to recognize the "@" symbol as the "src" folder in your project, you can modify the "resolve.alias"
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@api': path.resolve(__dirname, '../src/api'), // Nuevo alias para la carpeta 'src/api'
    }
  },
  plugins: [vue()],
})
