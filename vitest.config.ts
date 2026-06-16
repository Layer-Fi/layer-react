import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [react()],
  resolve: {
    extensions: ['.tsx', '.ts'],
    tsconfigPaths: true,
  },
  test: {
    css: true,
    environment: 'jsdom',
    setupFiles: './vitest.setup.ts',
  },
})
