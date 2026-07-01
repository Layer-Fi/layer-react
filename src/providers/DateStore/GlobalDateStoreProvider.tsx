import { type PropsWithChildren } from 'react'

import { type DateRange, makeDateStore } from '@providers/DateStore/makeDateStore'

export {
  clampToAfterActivationDate,
  clampToPresentOrPast,
  type DateRange,
  type DateSelectionMode,
} from '@providers/DateStore/makeDateStore'

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
