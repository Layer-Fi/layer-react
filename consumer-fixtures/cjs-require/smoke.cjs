// Resolves the `require` condition and executes the bundle: a module-scope crash here (bad
// interop, an ESM-only dependency that slipped past `external`) otherwise reaches consumers.
const pkg = require('@layerfi/components')

// Interop, not API surface: a broken ESM→CJS wrapper still resolves but exports nothing.
if (typeof pkg.LayerProvider !== 'function') {
  console.error(`require() resolved but LayerProvider is ${typeof pkg.LayerProvider}`)
  process.exit(1)
}

console.log(`require() resolved ${Object.keys(pkg).length} exports.`)
