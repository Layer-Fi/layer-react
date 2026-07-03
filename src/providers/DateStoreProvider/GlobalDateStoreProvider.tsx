import { type PropsWithChildren } from 'react'

import { createScopedDateStore } from '@providers/DateStoreProvider/internal/createScopedDateStore'

export { clampToAfterActivationDate, clampToPresentOrPast } from '@providers/DateStoreProvider/internal/dateStoreUtils'
export type { DateRange, DateSelectionMode } from '@providers/DateStoreProvider/internal/types'

const {
  Provider: GlobalDateStoreProvider,
  useDate: useGlobalDate,
  useDateActions: useGlobalDateActions,
  useDateRange: useGlobalDateRange,
  useDateRangeActions: useGlobalDateRangeActions,
  usePeriodAlignedActions: useGlobalDatePeriodAlignedActions,
} = makeDateStore()

export {
  GlobalDateStoreProvider,
  useGlobalDate,
  useGlobalDateActions,
  useGlobalDatePeriodAlignedActions,
  useGlobalDateRange,
  useGlobalDateRangeActions,
}
