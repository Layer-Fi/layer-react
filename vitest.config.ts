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
      reporter: ['text-summary', 'html', 'lcov', 'json-summary'],
      // A backstop against a real drop, not a target. Integer-valued and left ~1pt below actual: a
      // global percentage also moves when the denominator does (measured drift between branches is
      // ~0.2pt), so a floor set at actual fails PRs that changed nothing about testing.
      //
      // Raising it is the ratchet, and it is deliberate rather than automatic — `autoUpdate` would
      // have every concurrent PR rewriting these four lines. Run `npm run coverage:floor` to see
      // the headroom; when a metric sits 2pt or more above its floor, raise that floor by one in
      // its own PR. That keeps the slack in [1pt, 2pt): loose enough to absorb drift, tight enough
      // that deleting a suite still fails.
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
    // v8 instrumentation adds ~40% to test time, which puts the slower component tests over the
    // 5s default when the whole suite runs concurrently.
    testTimeout: 15_000,
    // Its own tsconfig: these read the built `dist/index.d.ts`, which the root config excludes.
    typecheck: {
      tsconfig: './type-tests/tsconfig.json',
      include: ['type-tests/**/*.test-d.ts'],
    },
  },
})
