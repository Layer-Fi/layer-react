import { createContext, type PropsWithChildren, useContext, useMemo, useState } from 'react'
import { createStore, useStore } from 'zustand'

import { TimeTrackingServicesDrawer } from '@components/TimeEntries/TimeTrackingServicesDrawer/TimeTrackingServicesDrawer'

type OpenServicesDrawerOptions = {
  startInCreateMode?: boolean
}

type TimeTrackingServicesDrawerStoreShape = {
  isOpen: boolean
  startInCreateMode: boolean
  actions: {
    openServicesDrawer: (options?: OpenServicesDrawerOptions) => void
    setOpen: (isOpen: boolean) => void
  }
}

const TimeTrackingServicesDrawerStoreContext = createContext(
  createStore<TimeTrackingServicesDrawerStoreShape>(() => ({
    isOpen: false,
    startInCreateMode: false,
    actions: {
      openServicesDrawer: () => {},
      setOpen: () => {},
    },
  })),
)

export function useTimeTrackingServicesDrawer() {
  const store = useContext(TimeTrackingServicesDrawerStoreContext)
  const openServicesDrawer = useStore(store, state => state.actions.openServicesDrawer)
  return useMemo(() => ({ openServicesDrawer }), [openServicesDrawer])
}

function useTimeTrackingServicesDrawerState() {
  const store = useContext(TimeTrackingServicesDrawerStoreContext)
  const isOpen = useStore(store, state => state.isOpen)
  const startInCreateMode = useStore(store, state => state.startInCreateMode)
  const setOpen = useStore(store, state => state.actions.setOpen)
  return useMemo(
    () => ({ isOpen, startInCreateMode, setOpen }),
    [isOpen, startInCreateMode, setOpen],
  )
}

export function TimeTrackingServicesDrawerProvider({ children }: PropsWithChildren) {
  const [store] = useState(() =>
    createStore<TimeTrackingServicesDrawerStoreShape>(set => ({
      isOpen: false,
      startInCreateMode: false,
      actions: {
        openServicesDrawer: ({ startInCreateMode = false }: OpenServicesDrawerOptions = {}) => {
          set({ isOpen: true, startInCreateMode })
        },
        setOpen: (isOpen: boolean) => {
          set(state => ({
            isOpen,
            startInCreateMode: isOpen ? state.startInCreateMode : false,
          }))
        },
      },
    })),
  )

  return (
    <TimeTrackingServicesDrawerStoreContext.Provider value={store}>
      {children}
      <TimeTrackingServicesDrawerHost />
    </TimeTrackingServicesDrawerStoreContext.Provider>
  )
}

function TimeTrackingServicesDrawerHost() {
  const { isOpen, startInCreateMode, setOpen } = useTimeTrackingServicesDrawerState()

  return (
    <TimeTrackingServicesDrawer
      isOpen={isOpen}
      onOpenChange={setOpen}
      startInCreateMode={startInCreateMode}
    />
  )
}
