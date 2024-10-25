const { build } = require('esbuild')
const { dependencies, peerDependencies } = require('../package.json')
const { Generator } = require('npm-dts')
const { sassPlugin } = require('esbuild-sass-plugin')

new Generator({
  entry: 'index.tsx',
  output: 'dist/index.d.ts',
  tsc: '-p ./tsconfig.json',
}).generate()

const entryPoints = ['src/index.tsx']

/**
 * @type {import('esbuild').BuildOptions}
 */
const sharedConfig = {
  entryPoints,
  bundle: true,
  minify: false,
  sourcemap: true,
  tsconfig: './tsconfig.json',
  target: 'es2016',
  external: [
    ...Object.keys(dependencies || {}),
    ...Object.keys(peerDependencies || {}),
  ],
  plugins: [sassPlugin()],
}

build({
  ...sharedConfig,
  entryPoints: [...entryPoints, 'src/styles/index.scss'],
  platform: 'node', // for CJS
  outdir: 'dist',
})

build({
  ...sharedConfig,
  outdir: 'dist/esm',
  platform: 'neutral', // for ESM
  format: 'esm',
})
