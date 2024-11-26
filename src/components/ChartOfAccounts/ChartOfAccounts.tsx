import React, { useContext } from 'react'
import { ChartOfAccountsContext } from '../../contexts/ChartOfAccountsContext'
import { LedgerAccountsContext } from '../../contexts/LedgerAccountsContext'
import { useChartOfAccounts } from '../../hooks/useChartOfAccounts'
import { useElementViewSize } from '../../hooks/useElementViewSize/useElementViewSize'
import { useLedgerAccounts } from '../../hooks/useLedgerAccounts'
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
  templateAccountsEditable?: boolean
  showReversalEntries?: boolean
}

export const ChartOfAccounts = (props: ChartOfAccountsProps) => {
  const chartOfAccountsContextData = useChartOfAccounts({
    withDates: props.withDateControl,
  })
  const ledgerAccountsContextData = useLedgerAccounts(
    props.showReversalEntries ?? false,
  )
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
  templateAccountsEditable,
}: ChartOfAccountsProps) => {
  const { accountId } = useContext(LedgerAccountsContext)
  const { view, containerRef } = useElementViewSize<HTMLDivElement>()

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
          templateAccountsEditable={templateAccountsEditable}
        />
      )}
    </Container>
  )
}
