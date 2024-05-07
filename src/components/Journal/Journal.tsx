import React, { createContext, useState } from 'react'
import { BREAKPOINTS } from '../../config/general'
import { useElementSize } from '../../hooks/useElementSize'
import { useJournal } from '../../hooks/useJournal'
import { Container } from '../Container'
import { JournalTable } from '../JournalTable'

export type View = 'mobile' | 'tablet' | 'desktop'

export interface JournalProps {
  asWidget?: boolean
}

export type JournalContextType = ReturnType<typeof useJournal>
export const JournalContext = createContext<JournalContextType>({
  data: undefined,
  isLoading: false,
  isValidating: false,
  error: undefined,
  refetch: () => {},
  errorEntry: undefined,
  isLoadingEntry: false,
  isValidatingEntry: false,
  selectedEntryId: undefined,
  setSelectedEntryId: () => {},
  closeSelectedEntry: () => {},
  create: () => {},
  submitForm: () => {},
  cancelForm: () => {},
  form: undefined,
  setForm: () => {},
  sendingForm: false,
  apiError: undefined,
})

export const Journal = (props: JournalProps) => {
  const JournalContextData = useJournal()
  return (
    <JournalContext.Provider value={JournalContextData}>
      <JournalContent />
    </JournalContext.Provider>
  )
}

const JournalContent = ({ asWidget }: JournalProps) => {
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
      <JournalTable view={view} containerRef={containerRef} />
    </Container>
  )
}
