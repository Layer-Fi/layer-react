import { createContext, type PropsWithChildren, useCallback, useContext, useMemo, useState } from 'react'

import { TimeTrackingServicesDrawer } from '@components/TimeEntries/TimeTrackingServicesDrawer/TimeTrackingServicesDrawer'

type OpenServicesDrawerOptions = {
  startInCreateMode?: boolean
}

type TimeTrackingServicesDrawerContextShape = {
  openServicesDrawer: (options?: OpenServicesDrawerOptions) => void
}

const TimeTrackingServicesDrawerContext = createContext<TimeTrackingServicesDrawerContextShape>({
  openServicesDrawer: () => {},
})

export function useTimeTrackingServicesDrawer() {
  return useContext(TimeTrackingServicesDrawerContext)
}

export function TimeTrackingServicesDrawerProvider({ children }: PropsWithChildren) {
  const [isOpen, setIsOpen] = useState(false)
  const [startInCreateMode, setStartInCreateMode] = useState(false)

  const openServicesDrawer = useCallback(({ startInCreateMode: shouldStartInCreateMode = false }: OpenServicesDrawerOptions = {}) => {
    setStartInCreateMode(shouldStartInCreateMode)
    setIsOpen(true)
  }, [])

  const onOpenChange = useCallback((open: boolean) => {
    setIsOpen(open)

    if (!open) {
      setStartInCreateMode(false)
    }
  }, [])

  const value = useMemo(
    () => ({ openServicesDrawer }),
    [openServicesDrawer],
  )

  return (
    <TimeTrackingServicesDrawerContext.Provider value={value}>
      {children}
      <TimeTrackingServicesDrawer
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        startInCreateMode={startInCreateMode}
      />
    </TimeTrackingServicesDrawerContext.Provider>
  )
}
