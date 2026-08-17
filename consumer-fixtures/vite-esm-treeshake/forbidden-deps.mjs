// Dependencies that `GlobalMonthPicker` does not need. Before per-module output the package was a
// single bundled module, so importing any export pulled in every one of these. They are shared
// between the vite config (which externalises them, keeping the package name in the output as a
// bare import) and the assertion below it.
export const FORBIDDEN_DEPS = [
  '@tanstack/react-form',
  '@tanstack/react-table',
  '@tanstack/react-virtual',
  'motion',
  'react-calendly',
  'react-dropzone',
  'react-plaid-link',
  'react-select',
  'recharts',
]
