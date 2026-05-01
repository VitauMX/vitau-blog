import { defineConfig } from 'astro/config'
import tailwindcss from '@tailwindcss/vite'
export default defineConfig({
  output: 'static',
  site: 'https://vitau.mx',
  build: {
    assets: 'blog/_astro',
  },
  vite: {
    plugins: [tailwindcss()],
  },
})
