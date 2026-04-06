import { defineConfig } from 'vite'
import { resolve } from 'path'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        // The key is the name of the output file
        // The value is the path to the source HTML
        main: resolve(__dirname, 'index.html'),
        admin: resolve(__dirname, 'login.html'),
      },
    },
  },
})
