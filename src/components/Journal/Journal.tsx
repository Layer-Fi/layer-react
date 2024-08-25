import React, { useState } from 'react'
import { ChartOfAccountsContext } from '../../contexts/ChartOfAccountsContext'
import { JournalContext } from '../../contexts/JournalContext'
import { TableProvider } from '../../contexts/TableContext'
import { useChartOfAccounts } from '../../hooks/useChartOfAccounts'
import { useElementViewSize } from '../../hooks/useElementViewSize'
import { useJournal } from '../../hooks/useJournal'
import { View } from '../../types/general'
import { Container } from '../Container'
import { JournalTable } from '../JournalTable'
import { JournalTableStringOverrides } from '../JournalTable/JournalTable'

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
        <TableProvider>
          <JournalContent {...props} />
        </TableProvider>
      </JournalContext.Provider>
    </ChartOfAccountsContext.Provider>
  )
}

const JournalContent = ({
  asWidget,
  config = JOURNAL_CONFIG,
  stringOverrides,
}: JournalProps) => {
  const [view, setView] = useState<View>('desktop')

  const containerRef = useElementViewSize<HTMLDivElement>(newView =>
    setView(newView),
  )

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
