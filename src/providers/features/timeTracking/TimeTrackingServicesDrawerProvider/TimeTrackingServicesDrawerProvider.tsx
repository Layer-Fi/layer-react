import { type ComponentType, createContext, type PropsWithChildren, useContext, useMemo, useState } from 'react'
import { createStore, useStore } from 'zustand'

type OpenServicesDrawerOptions = {
  startInCreateMode?: boolean
  initialName?: string
}

type TimeTrackingServicesDrawerStoreShape = {
  isOpen: boolean
  startInCreateMode: boolean
  initialName: string | undefined
  actions: {
    openServicesDrawer: (options?: OpenServicesDrawerOptions) => void
    setOpen: (isOpen: boolean) => void
  }
}

const TimeTrackingServicesDrawerStoreContext = createContext(
  createStore<TimeTrackingServicesDrawerStoreShape>(() => ({
    isOpen: false,
    startInCreateMode: false,
    initialName: undefined,
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

export function useTimeTrackingServicesDrawerState() {
  const store = useContext(TimeTrackingServicesDrawerStoreContext)
  const isOpen = useStore(store, state => state.isOpen)
  const startInCreateMode = useStore(store, state => state.startInCreateMode)
  const initialName = useStore(store, state => state.initialName)
  const setOpen = useStore(store, state => state.actions.setOpen)
  return useMemo(
    () => ({ isOpen, startInCreateMode, initialName, setOpen }),
    [isOpen, startInCreateMode, initialName, setOpen],
  )
}

/** Injected so the store does not depend on the feature UI it drives. */
type ServicesDrawerComponent = ComponentType<{
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
  startInCreateMode: boolean
  initialCreateName?: string
}>

type TimeTrackingServicesDrawerProviderProps = PropsWithChildren<{
  slots?: { Drawer?: ServicesDrawerComponent }
}>

export function TimeTrackingServicesDrawerProvider({
  children,
  slots: { Drawer } = {},
}: TimeTrackingServicesDrawerProviderProps) {
  const [store] = useState(() =>
    createStore<TimeTrackingServicesDrawerStoreShape>(set => ({
      isOpen: false,
      startInCreateMode: false,
      initialName: undefined,
      actions: {
        openServicesDrawer: ({ startInCreateMode = false, initialName }: OpenServicesDrawerOptions = {}) => {
          set({ isOpen: true, startInCreateMode, initialName })
        },
        setOpen: (isOpen: boolean) => {
          set(state => ({
            isOpen,
            startInCreateMode: isOpen ? state.startInCreateMode : false,
            initialName: isOpen ? state.initialName : undefined,
          }))
        },
      },
    })),
  )

  return (
    <TimeTrackingServicesDrawerStoreContext.Provider value={store}>
      {children}
      {Drawer ? <TimeTrackingServicesDrawerHost Drawer={Drawer} /> : null}
    </TimeTrackingServicesDrawerStoreContext.Provider>
  )
}

function TimeTrackingServicesDrawerHost({ Drawer }: { Drawer: ServicesDrawerComponent }) {
  const { isOpen, startInCreateMode, initialName, setOpen } = useTimeTrackingServicesDrawerState()

  return (
    <Drawer
      isOpen={isOpen}
      onOpenChange={setOpen}
      startInCreateMode={startInCreateMode}
      initialCreateName={initialName}
    />
  )
}
