import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    // esbuild's dep optimizer can't statically extract named exports from
    // lottie-react's UMD build (picked via the "browser" field), so it
    // collapses everything into a single default export and breaks the
    // component import. Point straight at the ESM build instead.
    alias: {
      'lottie-react': 'lottie-react/build/index.es.js',
    },
  },
})
