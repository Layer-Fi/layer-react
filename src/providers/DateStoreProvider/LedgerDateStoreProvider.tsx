import { DatePreset } from '@utils/date/dateRangePresets'
import { createScopedDateStore } from '@providers/DateStoreProvider/internal/createScopedDateStore'

/**
 * Date store scoped to the General Ledger, defaulting to `AllTime`. Resolving
 * `AllTime` needs the business activation date, so mount the Provider below
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
