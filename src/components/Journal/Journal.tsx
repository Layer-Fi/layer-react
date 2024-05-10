import React, { createContext, useState } from 'react'
import { BREAKPOINTS } from '../../config/general'
import { useChartOfAccounts } from '../../hooks/useChartOfAccounts'
import { useElementSize } from '../../hooks/useElementSize'
import { useJournal } from '../../hooks/useJournal'
import { ChartOfAccountsContext } from '../ChartOfAccounts'
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

export type JournalContextType = ReturnType<typeof useJournal>
export const JournalContext = createContext<JournalContextType>({
  data: undefined,
  isLoading: false,
  error: undefined,
  refetch: () => {},
  selectedEntryId: undefined,
  setSelectedEntryId: () => {},
  closeSelectedEntry: () => {},
  addEntry: () => {},
  addEntryLine: () => {},
  removeEntryLine: () => {},
  create: () => {},
  changeFormData: () => {},
  submitForm: () => {},
  cancelForm: () => {},
  form: undefined,
  setForm: () => {},
  sendingForm: false,
  apiError: undefined,
})

export const JOURNAL_CONFIG: JournalConfig = {
  form: {
    addEntryLinesLimit: 2,
  },
}

export const Journal = (props: JournalProps) => {
  const JournalContextData = useJournal()
  const AccountsContextData = useChartOfAccounts()
  return (
    <ChartOfAccountsContext.Provider value={AccountsContextData}>
      <JournalContext.Provider value={JournalContextData}>
        <JournalContent {...props} />
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
