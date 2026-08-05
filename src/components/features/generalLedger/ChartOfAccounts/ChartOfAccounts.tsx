import { type ReactNode, useContext } from 'react'

import { InAppLinkProvider, type LinkingMetadata } from '@providers/common/InAppLink/InAppLinkContext'
import { useElementViewSize } from '@hooks/utils/size/useElementViewSize'
import { ChartOfAccountsContext } from '@providers/features/generalLedger/ChartOfAccountsContext/ChartOfAccountsContext'
import { LedgerAccountsContext } from '@providers/features/generalLedger/LedgerAccountsContext/LedgerAccountsContext'
import { LedgerDateStoreProvider } from '@providers/features/generalLedger/LedgerDateStore/LedgerDateStoreProvider'
import { useChartOfAccounts } from '@hooks/legacy/useChartOfAccounts'
import { useLedgerAccounts } from '@hooks/legacy/useLedgerAccounts'
import { Loader } from '@ui/Loader/Loader'
import { Container } from '@blocks/Layout/Container/Container'
import { type ChartOfAccountsTableStringOverrides, ChartOfAccountsTableWithPanel } from '@features/generalLedger/ChartOfAccountsTableWithPanel/ChartOfAccountsTableWithPanel'
import { LedgerAccountPanel } from '@features/generalLedger/LedgerAccountPanel/LedgerAccountPanel'
import { type LedgerAccountStringOverrides } from '@features/generalLedger/LedgerAccountPanel/LedgerAccountPanel'

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
    <Container className='Layer__chart-of-accounts' ref={containerRef} asWidget={asWidget}>
      {selectedAccount
        ? (
          <LedgerAccountPanel
            stringOverrides={stringOverrides?.ledgerAccount}
          />
        )
        : (
          <ChartOfAccountsTableWithPanel
            asWidget={asWidget}
            withDateControl={withDateControl}
            withExpandAllButton={withExpandAllButton}
            showAddAccountButton={showAddAccountButton}
            stringOverrides={stringOverrides?.chartOfAccountsTable}
            templateAccountsEditable={templateAccountsEditable}
          />
        )}
    </Container>
  )
}
