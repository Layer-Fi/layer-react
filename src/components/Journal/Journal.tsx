import { ChartOfAccountsContext } from '../../contexts/ChartOfAccountsContext'
import { JournalContext } from '../../contexts/JournalContext'
import { useChartOfAccounts } from '../../hooks/useChartOfAccounts'
import { useElementViewSize } from '../../hooks/useElementViewSize/useElementViewSize'
import { useJournal } from '../../hooks/useJournal'
import { Container } from '../Container'
import { JournalTable } from '../JournalTable'
import { JournalTableStringOverrides } from '../JournalTable/JournalTableWithPanel'
import { InAppLinkProvider, LinkingMetadata } from '../../contexts/InAppLinkContext'
import { ReactNode } from 'react'

export interface JournalConfig {
  form: {
    addEntryLinesLimit?: number
  }
}

export interface JournalStringOverrides {
  journalTable?: JournalTableStringOverrides
}

export interface JournalProps {
  asWidget?: boolean
  config?: JournalConfig
  stringOverrides?: JournalStringOverrides
  convertToInAppLink?: (source: LinkingMetadata) => ReactNode | undefined
}

export const JOURNAL_CONFIG: JournalConfig = {
  form: {
    addEntryLinesLimit: 10,
  },
}

export const Journal = (props: JournalProps) => {
  const JournalContextData = useJournal()
  const AccountsContextData = useChartOfAccounts()
  return (
    <ChartOfAccountsContext.Provider value={AccountsContextData}>
      <JournalContext.Provider value={JournalContextData}>
        <InAppLinkProvider getInAppLink={props.convertToInAppLink}>
          <JournalContent {...props} />
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
