// Imports exactly one small component. The build externalises the dependencies it should not
// need, so check-treeshake.mjs can assert none of them appear as imports in the output.
import { GlobalMonthPicker } from '@layerfi/components'

export function App() {
  return <GlobalMonthPicker showLabel />
}
