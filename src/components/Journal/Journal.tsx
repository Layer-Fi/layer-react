import React, { useState } from 'react'
import { BREAKPOINTS } from '../../config/general'
import { ChartOfAccountsContext } from '../../contexts/ChartOfAccountsContext'
import { JournalContext } from '../../contexts/JournalContext'
import { TableProvider } from '../../contexts/TableContext'
import { useChartOfAccounts } from '../../hooks/useChartOfAccounts'
import { useElementSize } from '../../hooks/useElementSize'
import { useJournal } from '../../hooks/useJournal'
import { Container } from '../Container'
import { JournalTable } from '../JournalTable'

export type View = 'mobile' | 'tablet' | 'desktop'

export interface JournalConfig {
  form: {
    addEntryLinesLimit?: number
  }
}

export interface JournalProps {
  asWidget?: boolean
  config?: JournalConfig
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
}: JournalProps) => {
  const [view, setView] = useState<View>('desktop')

  const containerRef = useElementSize<HTMLDivElement>((_a, _b, { width }) => {
    if (width) {
      if (width >= BREAKPOINTS.TABLET && view !== 'desktop') {
        setView('desktop')
      } else if (
        width <= BREAKPOINTS.TABLET &&
        width > BREAKPOINTS.MOBILE &&
        view !== 'tablet'
      ) {
        setView('tablet')
      } else if (width < BREAKPOINTS.MOBILE && view !== 'mobile') {
        setView('mobile')
      }
    }
  })

  return (
    <Container name='journal' ref={containerRef} asWidget={asWidget}>
      <JournalTable view={view} containerRef={containerRef} config={config} />
    </Container>
  )
}
