// `require()` has to resolve the `require` condition and actually execute the CJS bundle. A
// module-scope crash here (bad interop, an ESM-only dependency that slipped past `external`)
// would otherwise only surface in a consumer's app.
const pkg = require('@layerfi/components')

const REQUIRED_EXPORTS = [
  'LayerProvider',
  'BankTransactions',
  'ProfitAndLoss',
  'BalanceSheet',
  'ChartOfAccounts',
  'Journal',
  'LinkedAccounts',
  'Tasks',
  'useLayerContext',
]

const missing = REQUIRED_EXPORTS.filter(name => typeof pkg[name] === 'undefined')

if (missing.length > 0) {
  console.error(`Missing from the CJS build: ${missing.join(', ')}`)
  process.exit(1)
}

console.log(`require() resolved ${Object.keys(pkg).length} exports.`)
