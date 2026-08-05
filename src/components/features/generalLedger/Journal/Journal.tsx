import { type ReactNode } from 'react'

import { InAppLinkProvider, type LinkingMetadata } from '@providers/common/InAppLink/InAppLinkContext'
import { useElementViewSize } from '@hooks/utils/size/useElementViewSize'
import { ChartOfAccountsContext } from '@providers/features/generalLedger/ChartOfAccountsContext/ChartOfAccountsContext'
import { JournalContext } from '@providers/features/generalLedger/JournalContext/JournalContext'
import { JournalRoute, JournalStoreProvider, useJournalRouteState } from '@providers/features/generalLedger/JournalStore/JournalStoreProvider'
import { LedgerDateStoreProvider } from '@providers/features/generalLedger/LedgerDateStore/LedgerDateStoreProvider'
import { useChartOfAccounts } from '@hooks/legacy/useChartOfAccounts'
import { useJournal } from '@hooks/legacy/useJournal'
import { Loader } from '@ui/Loader/Loader'
import { Container } from '@blocks/Layout/Container/Container'
import { JournalEntryDrawer } from '@features/generalLedger/JournalEntryDrawer/JournalEntryDrawer'
import { type JournalTableStringOverrides, JournalTableWithPanel } from '@features/generalLedger/JournalTableWithPanel/JournalTableWithPanel'

import './journal.scss'

export interface JournalStringOverrides {
  journalTable?: JournalTableStringOverrides
}

export interface JournalProps {
  asWidget?: boolean
  stringOverrides?: JournalStringOverrides
  renderInAppLink?: (source: LinkingMetadata) => ReactNode
  showTags?: boolean
  showCustomerVendor?: boolean
}

/**
 * Views already inside a `LedgerDateStoreProvider` (e.g. `GeneralLedger`) should
 * render {@link InternalJournal} instead to avoid a nested store.
 */
export const Journal = (props: JournalProps) => (
  <LedgerDateStoreProvider fallback={<Loader />}>
    <InternalJournal {...props} />
  </LedgerDateStoreProvider>
)

/** Assumes an ancestor `LedgerDateStoreProvider` is already mounted. */
export const InternalJournal = (props: JournalProps) => {
  const JournalContextData = useJournal()
  const AccountsContextData = useChartOfAccounts()
  return (
    <ChartOfAccountsContext.Provider value={AccountsContextData}>
      <JournalContext.Provider value={JournalContextData}>
        <InAppLinkProvider renderInAppLink={props.renderInAppLink}>
          <JournalStoreProvider>
            <JournalContent {...props} />
          </JournalStoreProvider>
        </InAppLinkProvider>
      </JournalContext.Provider>
    </ChartOfAccountsContext.Provider>
  )
}

const JournalContent = ({
  asWidget,
  stringOverrides,
  showTags = true,
  showCustomerVendor = true,
}: JournalProps) => {
  const routeState = useJournalRouteState()

  return routeState.route === JournalRoute.EntryForm
    ? <JournalEntryDrawer showTags={showTags} showCustomerVendor={showCustomerVendor} />
    : <JournalTableView asWidget={asWidget} stringOverrides={stringOverrides} />
}

const JournalTableView = ({
  asWidget,
  stringOverrides,
}: {
  asWidget?: boolean
  stringOverrides?: JournalStringOverrides
}) => {
  const { containerRef } = useElementViewSize<HTMLDivElement>()

  return (
    <Container className='Layer__journal' ref={containerRef} asWidget={asWidget}>
      <JournalTableWithPanel
        stringOverrides={stringOverrides?.journalTable}
      />
    </Container>
  )
}
