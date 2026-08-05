import { useBusinessActivationDateSafe } from '@hooks/features/business/useBusinessActivationDateSafe'
import { createScopedDateStore } from '@providers/common/DateStore/createScopedDateStore'

export type { DateRange, DateSelectionMode } from '@utils/shared/date/dateRange'
export { clampToAfterActivationDate, clampToPresentOrPast } from '@utils/shared/date/dateRange'

const {
  Provider: GlobalDateStoreProvider,
  useDate: useGlobalDate,
  useDateActions: useGlobalDateActions,
  useDateRange: useGlobalDateRange,
  useDateRangeActions: useGlobalDateRangeActions,
  useDatePreset: useGlobalDatePreset,
  useDatePresetActions: useGlobalDatePresetActions,
  usePeriodAlignedActions: useGlobalDatePeriodAlignedActions,
} = createScopedDateStore({ useActivationDate: useBusinessActivationDateSafe })

export {
  GlobalDateStoreProvider,
  useGlobalDate,
  useGlobalDateActions,
  useGlobalDatePeriodAlignedActions,
  useGlobalDatePreset,
  useGlobalDatePresetActions,
  useGlobalDateRange,
  useGlobalDateRangeActions,
}
