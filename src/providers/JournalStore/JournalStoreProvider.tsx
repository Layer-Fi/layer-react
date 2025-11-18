import { createContext, type PropsWithChildren, useContext, useState } from 'react'
import { createStore, useStore } from 'zustand'

export enum JournalRoute {
  Table = 'Table',
  EntryForm = 'EntryForm',
}

export enum JournalEntryMode {
  Create = 'Create',
}

type JournalEntryFormRouteState = {
  route: JournalRoute.EntryForm
  mode: JournalEntryMode.Create
}
type JournalTableRouteState = { route: JournalRoute.Table }
type JournalRouteState = JournalEntryFormRouteState | JournalTableRouteState

type JournalStoreShape = {
  routeState: JournalRouteState
  navigate: {
    toCreateEntry: () => void
    toJournalTable: () => void
  }
}

const JournalStoreContext = createContext(
  createStore<JournalStoreShape>(() => ({
    routeState: { route: JournalRoute.Table },
    navigate: {
      toCreateEntry: () => {},
      toJournalTable: () => {},
    },
  })),
)

const isJournalEntryForm = (routeState: JournalRouteState): routeState is JournalEntryFormRouteState => {
  return routeState.route === JournalRoute.EntryForm
}

export function useJournalRouteState() {
  const store = useContext(JournalStoreContext)
  return useStore(store, state => state.routeState)
}

export function useJournalEntryFormMode(): { mode: JournalEntryMode.Create } {
  const routeState = useJournalRouteState()
  if (!isJournalEntryForm(routeState)) throw new Error('Journal entry form view required')

  const { route, ...entryFormDetail } = routeState
  return entryFormDetail
}

export function useJournalNavigation() {
  const store = useContext(JournalStoreContext)
  return useStore(store, state => state.navigate)
}

export function JournalStoreProvider(props: PropsWithChildren) {
  const [store] = useState(() =>
    createStore<JournalStoreShape>(set => ({
      routeState: { route: JournalRoute.Table },
      navigate: {
        toCreateEntry: () => {
          set(() => ({
            routeState: {
              route: JournalRoute.EntryForm,
              mode: JournalEntryMode.Create,
            },
          }))
        },
        toJournalTable: () => {
          set(() => ({
            routeState: {
              route: JournalRoute.Table,
            },
          }))
        },
      },
    })),
  )

  return (
    <JournalStoreContext.Provider value={store}>
      {props.children}
    </JournalStoreContext.Provider>
  )
}
