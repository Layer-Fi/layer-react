import { ChartOfAccountsContext } from '@contexts/ChartOfAccountsContext/ChartOfAccountsContext'
import { JournalContext } from '@contexts/JournalContext/JournalContext'
import { useChartOfAccounts } from '@hooks/useChartOfAccounts/useChartOfAccounts'
import { useElementViewSize } from '@hooks/useElementViewSize/useElementViewSize'
import { useJournal } from '@hooks/useJournal/useJournal'
import { Container } from '@components/Container/Container'
import { JournalTableWithPanel, JournalTableStringOverrides } from '@components/JournalTable/JournalTableWithPanel'
import { InAppLinkProvider, LinkingMetadata } from '@contexts/InAppLinkContext'
import { JournalStoreProvider, useJournalRouteState, JournalRoute } from '@providers/JournalStore/JournalStoreProvider'
import { ReactNode } from 'react'
import { JournalEntryDrawer } from '@components/Journal/JournalEntryDrawer/JournalEntryDrawer'

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

export const Journal = (props: JournalProps) => {
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
  const { view, containerRef } = useElementViewSize<HTMLDivElement>()

  return (
    <Container name='journal' ref={containerRef} asWidget={asWidget}>
      <JournalTableWithPanel
        view={view}
        containerRef={containerRef}
        stringOverrides={stringOverrides?.journalTable}
      />
    </Container>
  )
}
