import { type PropsWithChildren } from 'react'

import { createScopedDateStore } from '@providers/DateStoreProvider/internal/createScopedDateStore'
import { DatePreset } from '@components/DateSelection/utils'

const {
  Provider,
  useDateRange: useLedgerDateRange,
  useDateRangeActions: useLedgerDateRangeActions,
} = createScopedDateStore({
  // Year to date, which preset detection reports as "This Year".
  initialDatePreset: DatePreset.ThisYear,
  storeName: 'LedgerDateStore',
})

export {
  useLedgerDateRange,
  useLedgerDateRangeActions,
}

type LedgerDateStoreProviderProps = PropsWithChildren

export function LedgerDateStoreProvider({
  children,
}: LedgerDateStoreProviderProps) {
  return <Provider>{children}</Provider>
}
