import { type ReactNode } from 'react'

import { InAppLinkProvider, type LinkingMetadata } from '@providers/common/InAppLink/InAppLinkContext'
import { useElementViewSize } from '@hooks/utils/size/useElementViewSize'
import { ChartOfAccountsDateScopeProvider } from '@providers/features/generalLedger/ChartOfAccountsDateScope/ChartOfAccountsDateScopeProvider'
import {
  ChartOfAccountsSelectionStoreProvider,
  useSelectedLedgerAccountId,
} from '@providers/features/generalLedger/ChartOfAccountsSelectionStore/ChartOfAccountsSelectionStoreProvider'
import { LedgerDateStoreProvider } from '@providers/features/generalLedger/LedgerDateStore/LedgerDateStoreProvider'
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
export const InternalChartOfAccounts = (props: ChartOfAccountsProps) => (
  <ChartOfAccountsDateScopeProvider isDateScoped={props.withDateControl ?? false}>
    <ChartOfAccountsSelectionStoreProvider>
      <InAppLinkProvider renderInAppLink={props.renderInAppLink}>
        <ChartOfAccountsContent {...props} />
      </InAppLinkProvider>
    </ChartOfAccountsSelectionStoreProvider>
  </ChartOfAccountsDateScopeProvider>
)

const ChartOfAccountsContent = ({
  asWidget,
  withDateControl = false,
  withExpandAllButton,
  stringOverrides,
  templateAccountsEditable,
  showAddAccountButton,
}: ChartOfAccountsProps) => {
  const selectedAccountId = useSelectedLedgerAccountId()
  const { containerRef } = useElementViewSize<HTMLDivElement>()

  return (
    <Container name='chart-of-accounts' ref={containerRef} asWidget={asWidget}>
      {selectedAccountId
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
