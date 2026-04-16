import { createContext, type PropsWithChildren, useContext, useEffect, useMemo, useState } from 'react'
import { createStore, useStore } from 'zustand'

import type { Customer } from '@schemas/customer'
import type { TimeEntry } from '@schemas/timeTracking'

type TimeEntriesStoreShape = {
  isDrawerOpen: boolean
  selectedEntry: TimeEntry | null
  isDeleteModalOpen: boolean
  entryToDelete: TimeEntry | null
  selectedCustomer: Customer | null
  selectedServiceId: string | null
  onStartTimer?: () => void
  isStartTimerDisabled?: boolean
  actions: {
    setDrawerOpen: (isOpen: boolean, entry?: TimeEntry | null) => void
    clearSelectedEntry: () => void
    setDeleteModalOpen: (isOpen: boolean, entry?: TimeEntry | null) => void
    onDeleteSuccess: () => void
    setSelectedCustomer: (customer: Customer | null) => void
    setSelectedServiceId: (serviceId: string | null) => void
  }
}

const TimeEntriesStoreContext = createContext(
  createStore<TimeEntriesStoreShape>(() => ({
    isDrawerOpen: false,
    selectedEntry: null,
    isDeleteModalOpen: false,
    entryToDelete: null,
    selectedCustomer: null,
    selectedServiceId: null,
    onStartTimer: undefined,
    isStartTimerDisabled: undefined,
    actions: {
      setDrawerOpen: () => {},
      clearSelectedEntry: () => {},
      setDeleteModalOpen: () => {},
      onDeleteSuccess: () => {},
      setSelectedCustomer: () => {},
      setSelectedServiceId: () => {},
    },
  })),
)

export function useTimeEntriesFilters() {
  const store = useContext(TimeEntriesStoreContext)
  const selectedCustomer = useStore(store, state => state.selectedCustomer)
  const selectedServiceId = useStore(store, state => state.selectedServiceId)
  const setSelectedCustomer = useStore(store, state => state.actions.setSelectedCustomer)
  const setSelectedServiceId = useStore(store, state => state.actions.setSelectedServiceId)
  return useMemo(
    () => ({ selectedCustomer, selectedServiceId, setSelectedCustomer, setSelectedServiceId }),
    [selectedCustomer, selectedServiceId, setSelectedCustomer, setSelectedServiceId],
  )
}

export function useTimeEntriesDrawer() {
  const store = useContext(TimeEntriesStoreContext)
  const isDrawerOpen = useStore(store, state => state.isDrawerOpen)
  const selectedEntry = useStore(store, state => state.selectedEntry)
  const setDrawerOpen = useStore(store, state => state.actions.setDrawerOpen)
  const clearSelectedEntry = useStore(store, state => state.actions.clearSelectedEntry)
  return useMemo(
    () => ({ isDrawerOpen, selectedEntry, setDrawerOpen, clearSelectedEntry }),
    [isDrawerOpen, selectedEntry, setDrawerOpen, clearSelectedEntry],
  )
}

export function useTimeEntriesDeleteModal() {
  const store = useContext(TimeEntriesStoreContext)
  const isDeleteModalOpen = useStore(store, state => state.isDeleteModalOpen)
  const entryToDelete = useStore(store, state => state.entryToDelete)
  const setDeleteModalOpen = useStore(store, state => state.actions.setDeleteModalOpen)
  const onDeleteSuccess = useStore(store, state => state.actions.onDeleteSuccess)
  return useMemo(
    () => ({ isDeleteModalOpen, entryToDelete, setDeleteModalOpen, onDeleteSuccess }),
    [isDeleteModalOpen, entryToDelete, setDeleteModalOpen, onDeleteSuccess],
  )
}

export function useTimeEntriesTimerConfig() {
  const store = useContext(TimeEntriesStoreContext)
  const onStartTimer = useStore(store, state => state.onStartTimer)
  const isStartTimerDisabled = useStore(store, state => state.isStartTimerDisabled)
  return useMemo(
    () => ({ onStartTimer, isStartTimerDisabled }),
    [onStartTimer, isStartTimerDisabled],
  )
}

interface TimeEntriesStoreProviderProps extends PropsWithChildren {
  onStartTimer?: () => void
  isStartTimerDisabled?: boolean
}

export function TimeEntriesStoreProvider({
  onStartTimer,
  isStartTimerDisabled,
  children,
}: TimeEntriesStoreProviderProps) {
  const [store] = useState(() =>
    createStore<TimeEntriesStoreShape>(set => ({
      isDrawerOpen: false,
      selectedEntry: null,
      isDeleteModalOpen: false,
      entryToDelete: null,
      selectedCustomer: null,
      selectedServiceId: null,
      onStartTimer,
      isStartTimerDisabled,
      actions: {
        setDrawerOpen: (isOpen: boolean, entry?: TimeEntry | null) => {
          set(state => ({
            isDrawerOpen: isOpen,
            selectedEntry: entry === undefined ? state.selectedEntry : entry,
          }))
        },
        clearSelectedEntry: () => {
          set({ selectedEntry: null })
        },
        setDeleteModalOpen: (isOpen: boolean, entry?: TimeEntry | null) => {
          set(state => ({
            isDeleteModalOpen: isOpen,
            entryToDelete: entry === undefined ? state.entryToDelete : entry,
          }))
        },
        onDeleteSuccess: () => {
          set({ isDeleteModalOpen: false, entryToDelete: null, selectedEntry: null, isDrawerOpen: false })
        },
        setSelectedCustomer: (customer: Customer | null) => {
          set({ selectedCustomer: customer })
        },
        setSelectedServiceId: (serviceId: string | null) => {
          set({ selectedServiceId: serviceId })
        },
      },
    })),
  )

  useEffect(() => {
    store.setState({ onStartTimer, isStartTimerDisabled })
  }, [store, onStartTimer, isStartTimerDisabled])

  return (
    <TimeEntriesStoreContext.Provider value={store}>
      {children}
    </TimeEntriesStoreContext.Provider>
  )
}
