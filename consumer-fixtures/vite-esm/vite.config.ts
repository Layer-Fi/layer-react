import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react()],
  build: {
    // The fixture is checked for console errors in a real browser, so keep the output readable
    // when a failure needs tracing back to a source position.
    minify: false,
  },
})
