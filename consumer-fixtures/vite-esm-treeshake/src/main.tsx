// Imports exactly one small component. The build externalises the dependencies it should not
// need, so check-treeshake.mjs can assert none of them appear as imports in the output.
import { GlobalMonthPicker } from '@layerfi/components'

// The same component through its own subpath, which exercises the `./*` export condition and its
// generated declaration file under a real bundler — `attw` reports wildcards as unverifiable.
import { GlobalMonthPicker as GlobalMonthPickerSubpath } from '@layerfi/components/GlobalMonthPicker'

export function App() {
  return (
    <>
      <GlobalMonthPicker showLabel />
      <GlobalMonthPickerSubpath showLabel />
    </>
  )
}
