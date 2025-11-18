import { ReactNode, useContext } from 'react'
import { ChartOfAccountsContext } from '@contexts/ChartOfAccountsContext/ChartOfAccountsContext'
import { LedgerAccountsContext } from '@contexts/LedgerAccountsContext/LedgerAccountsContext'
import { useChartOfAccounts } from '@hooks/useChartOfAccounts/useChartOfAccounts'
import { useElementViewSize } from '@hooks/useElementViewSize/useElementViewSize'
import { useLedgerAccounts } from '@hooks/useLedgerAccounts/useLedgerAccounts'
import { ChartOfAccountsTableWithPanel, ChartOfAccountsTableStringOverrides } from '@components/ChartOfAccountsTable/ChartOfAccountsTableWithPanel'
import { Container } from '@components/Container/Container'
import { LedgerAccount } from '@components/LedgerAccount/LedgerAccountIndex'
import { LedgerAccountStringOverrides } from '@components/LedgerAccount/LedgerAccountIndex'
import { InAppLinkProvider, LinkingMetadata } from '@contexts/InAppLinkContext'

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
  renderInAppLink?: (source: LinkingMetadata) => ReactNode
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
        <InAppLinkProvider renderInAppLink={props.renderInAppLink}>
          <ChartOfAccountsContent {...props} />
        </InAppLinkProvider>
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
          <ChartOfAccountsTableWithPanel
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
