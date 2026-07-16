import { type ReactNode, useContext } from 'react'

import { useChartOfAccounts } from '@hooks/legacy/useChartOfAccounts'
import { useLedgerAccounts } from '@hooks/legacy/useLedgerAccounts'
import { useElementViewSize } from '@hooks/utils/size/useElementViewSize'
import { LedgerDateStoreProvider } from '@providers/DateStoreProvider/LedgerDateStoreProvider'
import { ChartOfAccountsContext } from '@contexts/ChartOfAccountsContext/ChartOfAccountsContext'
import { InAppLinkProvider, type LinkingMetadata } from '@contexts/InAppLinkContext'
import { LedgerAccountsContext } from '@contexts/LedgerAccountsContext/LedgerAccountsContext'
import { type ChartOfAccountsTableStringOverrides, ChartOfAccountsTableWithPanel } from '@components/ChartOfAccountsTable/ChartOfAccountsTableWithPanel'
import { Container } from '@components/Container/Container'
import { LedgerAccountPanel } from '@components/LedgerAccountPanel/LedgerAccountPanel'
import { type LedgerAccountStringOverrides } from '@components/LedgerAccountPanel/LedgerAccountPanel'
import { Loader } from '@components/Loader/Loader'

import './chartOfAccounts.scss'

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
  renderInAppLink?: (source: LinkingMetadata) => ReactNode
}

/**
 * Views already inside a `LedgerDateStoreProvider` (e.g. `GeneralLedger`) should
 * render {@link InternalChartOfAccounts} instead to avoid a nested store.
 */
export const ChartOfAccounts = (props: ChartOfAccountsProps) => (
  <LedgerDateStoreProvider fallback={<Loader />}>
    <InternalChartOfAccounts {...props} />
  </LedgerDateStoreProvider>
)

/** Assumes an ancestor `LedgerDateStoreProvider` is already mounted. */
export const InternalChartOfAccounts = (props: ChartOfAccountsProps) => {
  const chartOfAccountsContextData = useChartOfAccounts({
    withDates: props.withDateControl,
  })
  const ledgerAccountsContextData = useLedgerAccounts()
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
  const { containerRef } = useElementViewSize<HTMLDivElement>()

  return (
    <Container name='chart-of-accounts' ref={containerRef} asWidget={asWidget}>
      {selectedAccount
        ? (
          <LedgerAccountPanel
            containerRef={containerRef}
            stringOverrides={stringOverrides?.ledgerAccount}
          />
        )
        : (
          <ChartOfAccountsTableWithPanel
            asWidget={asWidget}
            withDateControl={withDateControl}
            withExpandAllButton={withExpandAllButton}
            containerRef={containerRef}
            showAddAccountButton={showAddAccountButton}
            stringOverrides={stringOverrides?.chartOfAccountsTable}
            templateAccountsEditable={templateAccountsEditable}
          />
        )}
    </Container>
  )
}
