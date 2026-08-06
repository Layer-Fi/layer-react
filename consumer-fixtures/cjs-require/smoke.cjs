// `require()` has to resolve the `require` condition and actually execute the CJS bundle. A
// module-scope crash here (bad interop, an ESM-only dependency that slipped past `external`)
// would otherwise only surface in a consumer's app.
const pkg = require('@layerfi/components')

// Interop, not API surface: a broken ESM→CJS wrapper resolves and executes but leaves the
// namespace empty. Enumerating exports here would only duplicate the public-API snapshot.
if (typeof pkg.LayerProvider !== 'function') {
  console.error(`require() resolved but LayerProvider is ${typeof pkg.LayerProvider}`)
  process.exit(1)
}

console.log(`require() resolved ${Object.keys(pkg).length} exports.`)
