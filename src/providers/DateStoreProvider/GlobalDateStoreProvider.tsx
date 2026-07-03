import { type PropsWithChildren } from 'react'

import { createScopedDateStore } from '@providers/DateStoreProvider/internal/createScopedDateStore'

export { clampToAfterActivationDate, clampToPresentOrPast } from '@providers/DateStoreProvider/internal/dateStoreUtils'
export type { DateRange, DateSelectionMode } from '@providers/DateStoreProvider/internal/types'

const {
  Provider,
  useDate: useGlobalDate,
  useDateActions: useGlobalDateActions,
  useDateRange: useGlobalDateRange,
  useDateRangeActions: useGlobalDateRangeActions,
  usePeriodAlignedActions: useGlobalDatePeriodAlignedActions,
} = createScopedDateStore({ storeName: 'GlobalDateStore' })

export {
  useGlobalDate,
  useGlobalDateActions,
  useGlobalDatePeriodAlignedActions,
  useGlobalDateRange,
  useGlobalDateRangeActions,
}

type GlobalDateStoreProviderProps = PropsWithChildren

export function GlobalDateStoreProvider({
  children,
}: GlobalDateStoreProviderProps) {
  return <Provider>{children}</Provider>
}
