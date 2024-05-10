import React, { createContext, useContext, useState } from 'react'
import { BREAKPOINTS } from '../../config/general'
import { ChartOfAccountsContext } from '../../contexts/ChartOfAccountsContext'
import { LedgerAccountsContext } from '../../contexts/LedgerAccountsContext'
import { useChartOfAccounts } from '../../hooks/useChartOfAccounts'
import { useElementSize } from '../../hooks/useElementSize'
import { useLedgerAccounts } from '../../hooks/useLedgerAccounts'
import { ChartOfAccountsTable } from '../ChartOfAccountsTable'
import { Container } from '../Container'
import { LedgerAccount } from '../LedgerAccount'

export type View = 'mobile' | 'tablet' | 'desktop'

export interface ChartOfAccountsProps {
  asWidget?: boolean
  withDateControl?: boolean
  withExpandAllButton?: boolean
}

export const ChartOfAccounts = (props: ChartOfAccountsProps) => {
  const chartOfAccountsContextData = useChartOfAccounts({
    withDates: props.withDateControl,
  })
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
