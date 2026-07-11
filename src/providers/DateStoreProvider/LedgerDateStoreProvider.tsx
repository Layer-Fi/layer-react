import { DatePreset } from '@utils/date/dateRangePresets'
import { createScopedDateStore } from '@providers/DateStoreProvider/internal/createScopedDateStore'

/**
 * A date store scoped to the General Ledger. Unlike the global store it defaults
 * to `AllTime`, so the ledger opens showing the whole history and the Chart of
 * Accounts / Journal tabs share one range as you switch between them.
 *
 * Because `AllTime` needs the business activation date, the Provider defers
 * construction until the business context resolves — mount it below
 * `BusinessProvider` and give it a `fallback`.
 */
const {
  Provider: LedgerDateStoreProvider,
  useDateRange: useLedgerDateRange,
  useDateRangeActions: useLedgerDateRangeActions,
  useDatePreset: useLedgerDatePreset,
  useDatePresetActions: useLedgerDatePresetActions,
} = createScopedDateStore({ initialDatePreset: DatePreset.AllTime, storeName: 'LedgerDateStore' })

export {
  LedgerDateStoreProvider,
  useLedgerDatePreset,
  useLedgerDatePresetActions,
  useLedgerDateRange,
  useLedgerDateRangeActions,
}
