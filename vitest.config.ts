import react from '@vitejs/plugin-react'
import { configDefaults, defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [react()],
  resolve: {
    extensions: ['.tsx', '.ts'],
    tsconfigPaths: true,
  },
  test: {
    css: true,
    // Stale agent worktrees under .claude contain their own copies of the suite.
    exclude: [...configDefaults.exclude, '.claude/**'],
    environment: 'jsdom',
    setupFiles: './vitest.setup.ts',
    // Its own tsconfig: these read the built `dist/index.d.ts`, which the root config excludes.
    typecheck: {
      tsconfig: './type-tests/tsconfig.json',
      include: ['type-tests/**/*.test-d.ts'],
    },
  },
})
