import path from 'node:path'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

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
      isESM && !isWatch
        ? dts({
          tsconfigPath: './tsconfig.build.json',
          bundleTypes: true,
          outDirs: path.resolve(__dirname, OUT_DIR),
        })
        : null,
      isESM ? bundleCss() : null,
      (isWatch || isCJS) ? cleanupBuild() : null,
    ].filter(Boolean),

    build: {
      minify: false,
      cssMinify: false,
      cssCodeSplit: true,
      lib: isESM
        ? {
          entry: {
            /**
             * Important that the `styles/index.scss` entry is before `src/index.tsx` so that CSS
             * files imported from the styles index file appear earlier in the generated CSS than
             * the CSS for the individual components. This means individual component styles will
             * will be prioritized over global styles.
             */
            styles: path.resolve(__dirname, 'src/styles/index.scss'),
            index: path.resolve(__dirname, 'src/index.tsx'),
          },
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
          entryFileNames: isESM
            ? chunk => (chunk.name === 'styles' ? 'styles.mjs' : 'index.mjs')
            : 'index.cjs',
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
