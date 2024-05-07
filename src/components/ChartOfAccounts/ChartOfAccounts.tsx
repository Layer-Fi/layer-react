import React, { createContext, useContext, useState } from 'react'
import { BREAKPOINTS } from '../../config/general'
import { useChartOfAccounts } from '../../hooks/useChartOfAccounts'
import { useElementSize } from '../../hooks/useElementSize'
import { useLedgerAccounts } from '../../hooks/useLedgerAccounts'
import { ChartOfAccountsTable } from '../ChartOfAccountsTable'
import { Container } from '../Container'
import { LedgerAccount } from '../LedgerAccount'
import { endOfMonth, startOfMonth } from 'date-fns'

export type View = 'mobile' | 'tablet' | 'desktop'

export interface ChartOfAccountsProps {
  asWidget?: boolean
  withDateControl?: boolean
  withExpandAllButton?: boolean
}

export type ChartOfAccountsContextType = ReturnType<typeof useChartOfAccounts>
export const ChartOfAccountsContext = createContext<ChartOfAccountsContextType>(
  {
    data: undefined,
    isLoading: false,
    isValidating: false,
    error: undefined,
    refetch: () => {},
    create: () => {},
    form: undefined,
    sendingForm: false,
    apiError: undefined,
    addAccount: () => {},
    editAccount: () => {},
    cancelForm: () => {},
    changeFormData: () => {},
    submitForm: () => {},
    dateRange: {
      startDate: startOfMonth(new Date()),
      endDate: endOfMonth(new Date()),
    },
    changeDateRange: () => {},
  },
)

export type LedgerAccountsContextType = ReturnType<typeof useLedgerAccounts>
export const LedgerAccountsContext = createContext<LedgerAccountsContextType>({
  data: undefined,
  entryData: undefined,
  isLoading: false,
  isLoadingEntry: false,
  isValidating: false,
  isValidatingEntry: false,
  error: undefined,
  errorEntry: undefined,
  refetch: () => {},
  accountId: undefined,
  setAccountId: () => {},
  selectedEntryId: undefined,
  setSelectedEntryId: () => {},
  closeSelectedEntry: () => {},
})

export const ChartOfAccounts = (props: ChartOfAccountsProps) => {
  const chartOfAccountsContextData = useChartOfAccounts()
  const ledgerAccountsContextData = useLedgerAccounts()
  return (
    <ChartOfAccountsContext.Provider value={chartOfAccountsContextData}>
      <LedgerAccountsContext.Provider value={ledgerAccountsContextData}>
        <ChartOfAccountsContent {...props} />
      </LedgerAccountsContext.Provider>
    </ChartOfAccountsContext.Provider>
  )
}

const ChartOfAccountsContent = ({
  asWidget,
  withDateControl,
  withExpandAllButton,
}: ChartOfAccountsProps) => {
  const { accountId } = useContext(LedgerAccountsContext)

  const [view, setView] = useState<View>('desktop')

  const containerRef = useElementSize<HTMLDivElement>((_a, _b, { width }) => {
    if (width) {
      if (width >= BREAKPOINTS.TABLET && view !== 'desktop') {
        setView('desktop')
      } else if (
        width <= BREAKPOINTS.TABLET &&
        width > BREAKPOINTS.MOBILE &&
        view !== 'tablet'
      ) {
        setView('tablet')
      } else if (width < BREAKPOINTS.MOBILE && view !== 'mobile') {
        setView('mobile')
      }
    }
  })

  return (
    <Container name='chart-of-accounts' ref={containerRef} asWidget={asWidget}>
      {accountId ? (
        <LedgerAccount view={view} containerRef={containerRef} />
      ) : (
        <ChartOfAccountsTable
          asWidget={asWidget}
          withDateControl={withDateControl}
          withExpandAllButton={withExpandAllButton}
          view={view}
          containerRef={containerRef}
        />
      )}
    </Container>
  )
}
