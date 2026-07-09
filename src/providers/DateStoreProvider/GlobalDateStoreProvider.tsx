import { createScopedDateStore } from '@providers/DateStoreProvider/internal/createScopedDateStore'

export type { DateRange, DateSelectionMode } from '@utils/date/dateRange'
export { clampToAfterActivationDate, clampToPresentOrPast } from '@utils/date/dateRange'

const {
  Provider: GlobalDateStoreProvider,
  useDate: useGlobalDate,
  useDateActions: useGlobalDateActions,
  useDateRange: useGlobalDateRange,
  useDateRangeActions: useGlobalDateRangeActions,
  usePeriodAlignedActions: useGlobalDatePeriodAlignedActions,
  usePreset: useGlobalDatePreset,
} = createScopedDateStore()

export {
  GlobalDateStoreProvider,
  useGlobalDate,
  useGlobalDateActions,
  useGlobalDatePeriodAlignedActions,
  useGlobalDatePreset,
  useGlobalDateRange,
  useGlobalDateRangeActions,
}
