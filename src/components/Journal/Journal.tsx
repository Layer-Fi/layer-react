import { ChartOfAccountsContext } from '../../contexts/ChartOfAccountsContext'
import { JournalContext } from '../../contexts/JournalContext'
import { useChartOfAccounts } from '../../hooks/useChartOfAccounts'
import { useElementViewSize } from '../../hooks/useElementViewSize/useElementViewSize'
import { useJournal } from '../../hooks/useJournal'
import { Container } from '../Container'
import { JournalTable } from '../JournalTable'
import { JournalTableStringOverrides } from '../JournalTable/JournalTableWithPanel'
import { InAppLinkProvider, LinkingMetadata } from '../../contexts/InAppLinkContext'
import { JournalStoreProvider, useJournalRouteState, JournalRoute } from '../../providers/JournalStore'
import { ReactNode } from 'react'
import { JournalEntryDrawer } from './JournalEntryDrawer/JournalEntryDrawer'
import { usePreloadTagDimensions } from '../../features/tags/api/useTagDimensions'
import { INVOICE_MECE_TAG_DIMENSION } from '../Invoices/InvoiceForm/formUtils'

export interface JournalConfig {
  form: {
    addEntryLinesLimit?: number
    tagDimensionKeysInUse?: string[]

  }
}

export interface JournalStringOverrides {
  journalTable?: JournalTableStringOverrides
}

export interface JournalProps {
  asWidget?: boolean
  config?: JournalConfig
  stringOverrides?: JournalStringOverrides
  renderInAppLink?: (source: LinkingMetadata) => ReactNode
}

export const JOURNAL_CONFIG: JournalConfig = {
  form: {
    addEntryLinesLimit: 10,
    tagDimensionKeysInUse: [INVOICE_MECE_TAG_DIMENSION, 'entity'],
  },
}

export const Journal = (props: JournalProps) => {
  usePreloadTagDimensions()

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
  config = JOURNAL_CONFIG,
  stringOverrides,
}: JournalProps) => {
  const routeState = useJournalRouteState()

  return routeState.route === JournalRoute.EntryForm
    ? <JournalEntryDrawer config={config} />
    : <JournalTableView asWidget={asWidget} config={config} stringOverrides={stringOverrides} />
}

const JournalTableView = ({
  asWidget,
  config,
  stringOverrides,
}: {
  asWidget?: boolean
  config: JournalConfig
  stringOverrides?: JournalStringOverrides
}) => {
  const { view, containerRef } = useElementViewSize<HTMLDivElement>()

  return (
    <Container name='journal' ref={containerRef} asWidget={asWidget}>
      <JournalTable
        view={view}
        containerRef={containerRef}
        config={config}
        stringOverrides={stringOverrides?.journalTable}
      />
    </Container>
  )
}
