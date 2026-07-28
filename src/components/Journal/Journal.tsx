import { type ReactNode } from 'react'

import { useChartOfAccounts } from '@hooks/legacy/useChartOfAccounts'
import { useJournal } from '@hooks/legacy/useJournal'
import { useElementViewSize } from '@hooks/utils/size/useElementViewSize'
import { LedgerDateStoreProvider } from '@providers/DateStoreProvider/LedgerDateStoreProvider'
import { JournalRoute, JournalStoreProvider, useJournalRouteState } from '@providers/JournalStore/JournalStoreProvider'
import { ChartOfAccountsContext } from '@contexts/ChartOfAccountsContext/ChartOfAccountsContext'
import { InAppLinkProvider, type LinkingMetadata } from '@contexts/InAppLinkContext'
import { JournalContext } from '@contexts/JournalContext/JournalContext'
import { Container } from '@components/Container/Container'
import { JournalEntryDrawer } from '@components/Journal/JournalEntryDrawer/JournalEntryDrawer'
import { type JournalTableStringOverrides, JournalTableWithPanel } from '@components/JournalTable/JournalTableWithPanel'
import { Loader } from '@components/Loader/Loader'

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
    <Container name='journal' ref={containerRef} asWidget={asWidget}>
      <JournalTableWithPanel
        containerRef={containerRef}
        stringOverrides={stringOverrides?.journalTable}
      />
    </Container>
  )
}
