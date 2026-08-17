import path from 'node:path'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

import { bundleCss } from './vite/plugins/bundleCss'
import { cleanupBuild } from './vite/plugins/cleanupBuild'
import { buildExternalDeps, OUT_DIR } from './vite/utils'

export default defineConfig(({ mode, command }) => {
  const isESM = mode === 'esm'
  const isCJS = mode === 'cjs'
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
      (isWatch || isCJS) ? cleanupBuild() : null,
    ].filter(Boolean),

    build: {
      minify: false,
      cssMinify: false,
      // Per-module output would otherwise emit a stylesheet per component; the single
      // `dist/index.css` is the published contract.
      cssCodeSplit: !isESM,
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
          fileName: () => 'index.cjs',
        },
      rolldownOptions: {
        external: externalDeps,
        output: {
          dir: path.resolve(__dirname, `${OUT_DIR}/${mode}`),
          // One file per source module, so a consumer's bundler has real boundaries to prune
          // against. `sideEffects` in package.json is what makes those boundaries actionable.
          ...(isESM && { preserveModules: true, preserveModulesRoot: 'src' }),
          entryFileNames: isESM ? '[name].mjs' : 'index.cjs',
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
