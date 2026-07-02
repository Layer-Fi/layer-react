import { type PropsWithChildren } from 'react'

import { makeDateStore } from '@providers/DateStore/internal/dateStoreFactory'
import type { DateRange } from '@providers/DateStore/internal/types'

export { clampToAfterActivationDate, clampToPresentOrPast } from '@providers/DateStore/internal/dateStoreUtils'
export type { DateRange, DateSelectionMode } from '@providers/DateStore/internal/types'

export type GlobalDateState = DateRange

const {
  Provider,
  useDate: useGlobalDate,
  useDateActions: useGlobalDateActions,
  useDateRange: useGlobalDateRange,
  useDateRangeActions: useGlobalDateRangeActions,
  usePeriodAlignedActions: useGlobalDatePeriodAlignedActions,
} = makeDateStore()

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
