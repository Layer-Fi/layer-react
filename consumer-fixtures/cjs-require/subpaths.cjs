// The point of the subpath exports is that `require` — which never tree-shakes — can load one
// component without the rest of the library. This asserts that through the installed tarball, and
// that internal module paths are not reachable.
const assert = require('node:assert')

function layerModulesLoaded() {
  return Object.keys(require.cache).filter(key => key.includes('/dist/cjs/')).length
}

const { GlobalMonthPicker } = require('@layerfi/components/GlobalMonthPicker')
assert.strictEqual(typeof GlobalMonthPicker, 'function', 'subpath did not export a component')

const narrow = layerModulesLoaded()

// The barrel is a single bundled file on purpose, so this is 1 file rather than ~1350.
const pkg = require('@layerfi/components')
assert.strictEqual(typeof pkg.LayerProvider, 'function')

// Internals stay private: `./*` only maps into `dist/exports`, which holds the public names.
for (const internal of ['components/ui/Button/Button', 'NotAnExport']) {
  assert.throws(
    () => require(`@layerfi/components/${internal}`),
    /Cannot find module|ERR_PACKAGE_PATH_NOT_EXPORTED/,
    `@layerfi/components/${internal} should not resolve`,
  )
}

// A guard, not a benchmark: whole-library-through-a-subpath would land in the high hundreds.
assert.ok(narrow < 200, `subpath pulled in ${narrow} modules, expected well under 200`)

console.log(`require('@layerfi/components/GlobalMonthPicker') loaded ${narrow} modules; internals stay private.`)
