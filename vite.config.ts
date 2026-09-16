import path from 'node:path'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

import { bundleCss } from './vite/plugins/bundleCss'
import { cleanupBuild } from './vite/plugins/cleanupBuild'
import { stubStyles } from './vite/plugins/stubStyles'
import { writeModuleManifest } from './vite/plugins/writeModuleManifest'
import { buildExternalDeps, OUT_DIR } from './vite/utils'

/**
 * Three outputs, because the two module systems want opposite things:
 *
 * - `esm`         per-module, so a consumer's bundler can tree-shake. `dist/esm/**`
 * - `cjs`         one bundled file for the `.` entry. `require` never tree-shakes, and splitting
 *                 the barrel into 1351 files made `require('@layerfi/components')` ~50% slower.
 *                 `dist/cjs/index.cjs`
 * - `cjs-modules` per-module, reachable only through the generated `dist/exports/*.cjs` shims, so
 *                 `require('@layerfi/components/GlobalMonthPicker')` loads 72 files instead of
 *                 1351. Shared files rather than per-entry bundles, or two subpaths would each get
 *                 their own copy of every React context. `dist/cjs/modules/**`
 */
export default defineConfig(({ mode, command }) => {
  const isESM = mode === 'esm'
  const isCJSBundle = mode === 'cjs'
  const isCJSModules = mode === 'cjs-modules'
  const isCJS = isCJSBundle || isCJSModules
  const perModule = isESM || isCJSModules
  const isWatch = command === 'build' && process.argv.includes('--watch')

  const externalDeps = buildExternalDeps({
    mode: isCJS ? 'cjs' : 'esm',
    bundleForCjs: ['lodash-es', 'react-merge-refs'],
  })

  return {
    publicDir: false,

    plugins: [
      react(),
      isESM ? bundleCss() : null,
      isCJS ? stubStyles() : null,
      perModule ? writeModuleManifest(isESM ? 'esm' : 'cjs') : null,
      (isWatch || isCJS) ? cleanupBuild() : null,
    ].filter(Boolean),

    build: {
      minify: false,
      cssMinify: false,
      // Per-module output would otherwise emit a stylesheet per component; the single
      // `dist/index.css` is the published contract. Splitting also corrupts the CJS output —
      // the per-module CSS placeholders leave `const require_X = ;` behind.
      cssCodeSplit: false,
      lib: isESM
        ? {
          /**
           * `preserveModules` cannot carry a pure-CSS entry (vite:css-post crashes resolving its
           * reference id), so the styles index is imported from `src/index.tsx` instead, as its
           * first import. Module execution order then puts global styles first in the generated
           * CSS, so component styles win on equal specificity.
           */
          entry: path.resolve(__dirname, 'src/index.tsx'),
          formats: ['es'],
        }
        : {
          entry: path.resolve(__dirname, 'src/index.tsx'),
          formats: ['cjs'],
          ...(isCJSBundle && { fileName: () => 'index.cjs' }),
        },
      rolldownOptions: {
        external: externalDeps,
        output: {
          dir: path.resolve(__dirname, isCJSModules ? `${OUT_DIR}/cjs/modules` : `${OUT_DIR}/${mode}`),
          // One file per source module, so a consumer's bundler has real boundaries to prune
          // against. `sideEffects` in package.json is what makes those boundaries actionable.
          ...(perModule && { preserveModules: true, preserveModulesRoot: 'src' }),
          entryFileNames: isESM ? '[name].mjs' : isCJSModules ? '[name].cjs' : 'index.cjs',
          chunkFileNames: isESM ? '[name].mjs' : '[name].cjs',
          exports: isCJS ? 'named' : undefined,
        },
      },
      outDir: path.resolve(__dirname, OUT_DIR),
      target: 'es2016',
      emptyOutDir: isESM && !isWatch,
    },

    resolve: {
      extensions: ['.tsx', '.ts'],
      tsconfigPaths: true,
    },
  }
})
