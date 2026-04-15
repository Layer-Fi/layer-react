import { createContext, type PropsWithChildren, useContext, useMemo, useState } from 'react'
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
  actions: {
    openDrawer: (entry: TimeEntry | null) => void
    setDrawerOpen: (isOpen: boolean) => void
    clearSelectedEntry: () => void
    openDeleteModal: (entry: TimeEntry) => void
    setDeleteModalOpen: (isOpen: boolean) => void
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
    actions: {
      openDrawer: () => {},
      setDrawerOpen: () => {},
      clearSelectedEntry: () => {},
      openDeleteModal: () => {},
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
  const openDrawer = useStore(store, state => state.actions.openDrawer)
  const setDrawerOpen = useStore(store, state => state.actions.setDrawerOpen)
  const clearSelectedEntry = useStore(store, state => state.actions.clearSelectedEntry)
  return useMemo(
    () => ({ isDrawerOpen, selectedEntry, openDrawer, setDrawerOpen, clearSelectedEntry }),
    [isDrawerOpen, selectedEntry, openDrawer, setDrawerOpen, clearSelectedEntry],
  )
}

export function useTimeEntriesDeleteModal() {
  const store = useContext(TimeEntriesStoreContext)
  const isDeleteModalOpen = useStore(store, state => state.isDeleteModalOpen)
  const entryToDelete = useStore(store, state => state.entryToDelete)
  const openDeleteModal = useStore(store, state => state.actions.openDeleteModal)
  const setDeleteModalOpen = useStore(store, state => state.actions.setDeleteModalOpen)
  const onDeleteSuccess = useStore(store, state => state.actions.onDeleteSuccess)
  return useMemo(
    () => ({ isDeleteModalOpen, entryToDelete, openDeleteModal, setDeleteModalOpen, onDeleteSuccess }),
    [isDeleteModalOpen, entryToDelete, openDeleteModal, setDeleteModalOpen, onDeleteSuccess],
  )
}

export function TimeEntriesStoreProvider(props: PropsWithChildren) {
  const [store] = useState(() =>
    createStore<TimeEntriesStoreShape>(set => ({
      isDrawerOpen: false,
      selectedEntry: null,
      isDeleteModalOpen: false,
      entryToDelete: null,
      selectedCustomer: null,
      selectedServiceId: null,
      actions: {
        openDrawer: (entry: TimeEntry | null) => {
          set({ selectedEntry: entry, isDrawerOpen: true })
        },
        setDrawerOpen: (isOpen: boolean) => {
          set({ isDrawerOpen: isOpen })
        },
        clearSelectedEntry: () => {
          set({ selectedEntry: null })
        },
        openDeleteModal: (entry: TimeEntry) => {
          set({ entryToDelete: entry, isDeleteModalOpen: true })
        },
        setDeleteModalOpen: (isOpen: boolean) => {
          set({ isDeleteModalOpen: isOpen })
        },
        onDeleteSuccess: () => {
          set({ isDeleteModalOpen: false, selectedEntry: null, isDrawerOpen: false })
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

  return (
    <TimeEntriesStoreContext.Provider value={store}>
      {props.children}
    </TimeEntriesStoreContext.Provider>
  )
}
