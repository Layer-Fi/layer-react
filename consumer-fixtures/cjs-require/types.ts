import type { EventCallbacks } from '@layerfi/components'
import { BankTransactions, LayerProvider } from '@layerfi/components'

// A CJS consumer that still type-checks: proves `exports.types` resolves under node16 resolution
// and that the public types are usable, not just present.
const callbacks: EventCallbacks = {}

export const consumed = {
  provider: LayerProvider,
  bankTransactions: BankTransactions,
  callbacks,
}
