import { ReactNode, useContext } from 'react'
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
import { LedgerEntrySourceLinkProvider } from '../../contexts/LedgerEntrySourceContext'
import { LedgerEntrySourceType } from '../../schemas/ledgerEntrySourceSchemas'

export interface ChartOfAccountsStringOverrides {
  chartOfAccountsTable?: ChartOfAccountsTableStringOverrides
  ledgerAccount?: LedgerAccountStringOverrides
}

export interface ChartOfAccountsProps {
  asWidget?: boolean
  withDateControl?: boolean
  withExpandAllButton?: boolean
  stringOverrides?: ChartOfAccountsStringOverrides
  showAddAccountButton?: boolean
  templateAccountsEditable?: boolean
  showReversalEntries?: boolean
  convertLedgerEntrySourceToInAppLink?: (source: LedgerEntrySourceType) => ReactNode | undefined
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
        <LedgerEntrySourceLinkProvider convertToInAppLink={props.convertLedgerEntrySourceToInAppLink}>
          <ChartOfAccountsContent {...props} />
        </LedgerEntrySourceLinkProvider>
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
  showAddAccountButton,
}: ChartOfAccountsProps) => {
  const { selectedAccount } = useContext(LedgerAccountsContext)
  const { view, containerRef } = useElementViewSize<HTMLDivElement>()

  return (
    <Container name='chart-of-accounts' ref={containerRef} asWidget={asWidget}>
      {selectedAccount
        ? (
          <LedgerAccount
            view={view}
            containerRef={containerRef}
            stringOverrides={stringOverrides?.ledgerAccount}
          />
        )
        : (
          <ChartOfAccountsTable
            asWidget={asWidget}
            withDateControl={withDateControl}
            withExpandAllButton={withExpandAllButton}
            view={view}
            containerRef={containerRef}
            showAddAccountButton={showAddAccountButton}
            stringOverrides={stringOverrides?.chartOfAccountsTable}
            templateAccountsEditable={templateAccountsEditable}
          />
        )}
    </Container>
  )
}
