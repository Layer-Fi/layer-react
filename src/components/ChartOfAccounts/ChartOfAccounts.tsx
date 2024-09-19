import React, { useContext, useState } from 'react'
import { BREAKPOINTS } from '../../config/general'
import { ChartOfAccountsContext } from '../../contexts/ChartOfAccountsContext'
import { LedgerAccountsContext } from '../../contexts/LedgerAccountsContext'
import { useChartOfAccounts } from '../../hooks/useChartOfAccounts'
import { useElementViewSize } from '../../hooks/useElementViewSize'
import { useLedgerAccounts } from '../../hooks/useLedgerAccounts'
import { View } from '../../types/general'
import { ChartOfAccountsTable } from '../ChartOfAccountsTable'
import { ChartOfAccountsTableStringOverrides } from '../ChartOfAccountsTable/ChartOfAccountsTableWithPanel'
import { Container } from '../Container'
import { LedgerAccount } from '../LedgerAccount'
import { LedgerAccountStringOverrides } from '../LedgerAccount/LedgerAccountIndex'

export interface ChartOfAccountsStringOverrides {
  chartOfAccountsTable?: ChartOfAccountsTableStringOverrides
  ledgerAccount?: LedgerAccountStringOverrides
}

export interface ChartOfAccountsProps {
  asWidget?: boolean
  withDateControl?: boolean
  withExpandAllButton?: boolean
  stringOverrides?: ChartOfAccountsStringOverrides
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
  stringOverrides,
}: ChartOfAccountsProps) => {
  const { accountId } = useContext(LedgerAccountsContext)

  const [view, setView] = useState<View>('desktop')

  const containerRef = useElementViewSize<HTMLDivElement>(newView =>
    setView(newView),
  )

  return (
    <Container name='chart-of-accounts' ref={containerRef} asWidget={asWidget}>
      {accountId ? (
        <LedgerAccount
          view={view}
          containerRef={containerRef}
          stringOverrides={stringOverrides?.ledgerAccount}
        />
      ) : (
        <ChartOfAccountsTable
          asWidget={asWidget}
          withDateControl={withDateControl}
          withExpandAllButton={withExpandAllButton}
          view={view}
          containerRef={containerRef}
          stringOverrides={stringOverrides?.chartOfAccountsTable}
        />
      )}
    </Container>
  )
}
