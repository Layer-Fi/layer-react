import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import dts from 'vite-plugin-dts'
import path from 'node:path'
import pkg from '../package.json'
import { bundleCss } from './plugins/bundleCss'
import { cleanupBuild } from './plugins/cleanupBuild'
import { OUT_DIR } from './constants'

function buildExternalDeps(): (string | RegExp)[] {
  const deps = [
    ...Object.keys(pkg.peerDependencies ?? {}),
    ...Object.keys(pkg.dependencies ?? {}),
  ]
  return deps.map((dep) => {
    const escaped = dep.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    return new RegExp(`^${escaped}($|/)`)
  })
}

export default defineConfig(({ mode, command }) => {
  const isESM = mode === 'esm'
  const isCJS = mode === 'cjs'
  const isWatch = command === 'build' && process.argv.includes('--watch')

  return {
    publicDir: false,

    plugins: [
      react(),
      isESM
        ? dts({
          entryRoot: 'src',
          outDir: OUT_DIR,
          tsconfigPath: './tsconfig.json',
          rollupTypes: true,
          insertTypesEntry: true,
          logLevel: 'error',
          include: ['src/**/*.ts', 'src/**/*.tsx'],
        })
        : null,
      isESM ? bundleCss() : null,
      (isWatch || isCJS) ? cleanupBuild() : null,
    ].filter(Boolean),

    build: {
      minify: false,
      cssMinify: false,
      cssCodeSplit: false,
      lib: isESM
        ? {
          entry: {
            index: path.resolve(__dirname, '../src/index.tsx'),
            styles: path.resolve(__dirname, '../src/styles/index.scss'),
          },
          formats: ['es'],
        }
        : {
          entry: path.resolve(__dirname, '../src/index.tsx'),
          formats: ['cjs'],
          fileName: () => 'index.cjs',
        },
      rollupOptions: {
        external: buildExternalDeps(),
        output: {
          dir: path.resolve(__dirname, `../${OUT_DIR}/${mode}`),
          entryFileNames: isESM
            ? chunk => (chunk.name === 'styles' ? 'styles.mjs' : 'index.mjs')
            : 'index.cjs',
          chunkFileNames: isESM ? '[name].mjs' : '[name].cjs',
          exports: isCJS ? 'named' : undefined,
        },
      },
      outDir: path.resolve(__dirname, `../${OUT_DIR}`),
      target: 'es2022',
      emptyOutDir: isESM && !isWatch,
    },

    resolve: {
      extensions: ['.tsx', '.ts'],
    },
  }
})
