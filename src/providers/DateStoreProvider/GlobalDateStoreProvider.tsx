import { createScopedDateStore } from '@providers/DateStoreProvider/internal/createScopedDateStore'

export type { DateRange, DateSelectionMode } from '@utils/date/dateRange'
export { clampToAfterActivationDate, clampToPresentOrPast } from '@utils/date/dateRange'

const {
  Provider: GlobalDateStoreProvider,
  useDate: useGlobalDate,
  useDateActions: useGlobalDateActions,
  useDateRange: useGlobalDateRange,
  useDateRangeActions: useGlobalDateRangeActions,
  usePresetRange: useGlobalPresetRange,
  usePresetRangeActions: useGlobalPresetRangeActions,
  usePeriodAlignedActions: useGlobalDatePeriodAlignedActions,
} = createScopedDateStore()

export {
  GlobalDateStoreProvider,
  useGlobalDate,
  useGlobalDateActions,
  useGlobalDatePeriodAlignedActions,
  useGlobalDateRange,
  useGlobalDateRangeActions,
  useGlobalPresetRange,
  useGlobalPresetRangeActions,
}
