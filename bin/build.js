const { build } = require('esbuild')
const { dependencies, peerDependencies } = require('../package.json')
const { Generator } = require('npm-dts')

new Generator({
  entry: 'src/index.tsx',
  output: 'dist/index.d.ts',
  tsc: '-p ./tsconfig.json',
}).generate()

const sharedConfig = {
  entryPoints: ['src/index.tsx'],
  bundle: true,
  minify: false,
  sourcemap: true,
  tsconfig: './tsconfig.json',
  external: [
    ...Object.keys(dependencies || {}),
    ...Object.keys(peerDependencies || {}),
  ],
}

build({
  ...sharedConfig,
  platform: 'node', // for CJS
  outfile: 'dist/index.js',
})

build({
  ...sharedConfig,
  outfile: 'dist/index.esm.js',
  platform: 'neutral', // for ESM
  format: 'esm',
})
