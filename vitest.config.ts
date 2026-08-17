import path from 'node:path'
import react from '@vitejs/plugin-react'
import { configDefaults, defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [react()],
  // `test.css` compiles stylesheets, so the shared partials have to resolve here too.
  css: {
    preprocessorOptions: {
      scss: { loadPaths: [path.resolve(__dirname, 'src/styles')] },
    },
  },
  resolve: {
    extensions: ['.tsx', '.ts'],
    tsconfigPaths: true,
  },
  test: {
    css: true,
    coverage: {
      provider: 'v8',
      include: ['src/**/*.{ts,tsx}'],
      // Test infrastructure, ambient declarations, and stories — none of it production code, and
      // the first three have their own gates (msw:check-coverage, fixtures:check).
      exclude: [
        'src/msw/**',
        'src/fixtures/**',
        'src/testUtils/**',
        'src/types/**',
        'src/**/*.stories.tsx',
        'src/**/*.storyData.tsx',
        'src/**/*.{test,spec}.{ts,tsx}',
      ],
      // text-summary prints in CI; json-summary is what `npm run coverage:floor` reads. The html
      // and lcov reporters write generated JS and CSS that both linters then have to ignore.
      reporter: ['text-summary', 'json-summary'],
      // A backstop against a real drop, not a target — see src/testUtils/SKILL.md.
      thresholds: {
        autoUpdate: false,
        lines: 30,
        statements: 29,
        functions: 16,
        branches: 11,
      },
    },
    // Stale agent worktrees under .claude contain their own copies of the suite.
    exclude: [...configDefaults.exclude, '.claude/**'],
    environment: 'jsdom',
    setupFiles: './vitest.setup.ts',
    // v8 instrumentation put RecordBankTransactionModal over the 5s default.
    testTimeout: 15_000,
    // Its own tsconfig: these read the built `dist/index.d.ts`, which the root config excludes.
    typecheck: {
      tsconfig: './type-tests/tsconfig.json',
      include: ['type-tests/**/*.test-d.ts'],
    },
  },
})
