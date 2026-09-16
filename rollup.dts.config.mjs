import { dts } from 'rollup-plugin-dts'

import pkg from './package.json' with { type: 'json' }

// Externalize peer + runtime deps so their types aren't inlined into the bundle.
// Mirrors buildExternalDeps() used for the JS build in vite/utils.ts.
const external = [
  /\.s?css$/,
  ...[
    ...Object.keys(pkg.peerDependencies ?? {}),
    ...Object.keys(pkg.dependencies ?? {}),
  ].map(dep => new RegExp(`^${dep.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}($|/)`)),
]

export default {
  input: './dist/.types/index.d.ts',
  output: { file: './dist/index.d.ts', format: 'es' },
  external,
  plugins: [dts()],
}
