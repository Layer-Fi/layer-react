import { createContext, type PropsWithChildren, useContext, useMemo, useState } from 'react'
import { createStore, useStore } from 'zustand'

import type { InvoiceFormMode } from '@components/Invoices/InvoiceForm/InvoiceForm'
import { ALL_OPTION, type InvoiceStatusOption } from '@components/Invoices/InvoiceTable/InvoiceTable'
import { UpsertInvoiceMode } from '@features/invoices/api/useUpsertInvoice'
import type { Invoice } from '@features/invoices/invoiceSchemas'

export type InvoiceTableFilters = {
  status: InvoiceStatusOption
  query: string
}

export enum InvoiceRoute {
  Table = 'Table',
  Detail = 'Detail',
}

type InvoiceDetailRouteState = { route: InvoiceRoute.Detail } & InvoiceFormMode
type InvoiceTableRouteState = { route: InvoiceRoute.Table }
type InvoiceRouteState = InvoiceDetailRouteState | InvoiceTableRouteState

type InvoicesRouteStoreShape = {
  routeState: InvoiceRouteState
  tableFilters: InvoiceTableFilters
  setTableFilters: (patchFilters: Partial<InvoiceTableFilters>) => void
  navigate: {
    toCreateInvoice: () => void
    toInvoiceTable: () => void
    toViewInvoice: (invoice: Invoice) => void
  }
}

const InvoicesRouteStoreContext = createContext(
  createStore<InvoicesRouteStoreShape>(() => ({
    routeState: { route: InvoiceRoute.Table },
    tableFilters: { status: ALL_OPTION, query: '' },
    setTableFilters: () => {},
    navigate: {
      toCreateInvoice: () => {},
      toInvoiceTable: () => {},
      toViewInvoice: () => {},
    },
  })),
)

const isInvoiceDetail = (routeState: InvoiceRouteState): routeState is InvoiceDetailRouteState => {
  return routeState.route === InvoiceRoute.Detail
}

export function useInvoiceRouteState() {
  const store = useContext(InvoicesRouteStoreContext)
  return useStore(store, state => state.routeState)
}

export function useInvoiceDetail(): InvoiceFormMode {
  const routeState = useInvoiceRouteState()
  if (!isInvoiceDetail(routeState)) throw new Error('Invoice detail view required')

  const { route, ...invoiceDetail } = routeState
  return invoiceDetail
}

export function useInvoiceTableFilters() {
  const store = useContext(InvoicesRouteStoreContext)
  const tableFilters = useStore(store, state => state.tableFilters)
  const setTableFilters = useStore(store, state => state.setTableFilters)

  return useMemo(() => ({ tableFilters, setTableFilters }), [tableFilters, setTableFilters])
}

export function useInvoiceNavigation() {
  const store = useContext(InvoicesRouteStoreContext)
  return useStore(store, state => state.navigate)
}

export function InvoicesRouteStoreProvider(props: PropsWithChildren) {
  const [store] = useState(() =>
    createStore<InvoicesRouteStoreShape>(set => ({
      routeState: { route: InvoiceRoute.Table },
      tableFilters: { status: ALL_OPTION, query: '' },
      setTableFilters: (patchFilters: Partial<InvoiceTableFilters>) => {
        set(state => ({
          tableFilters: {
            ...state.tableFilters,
            ...patchFilters,
          },
        }))
      },
      navigate: {
        toCreateInvoice: () => {
          set(() => ({
            routeState: {
              route: InvoiceRoute.Detail,
              mode: UpsertInvoiceMode.Create,
            },
          }))
        },
        toInvoiceTable: () => {
          set(() => ({
            routeState: {
              route: InvoiceRoute.Table,
            },
          }))
        },
        toViewInvoice: (invoice: Invoice) => {
          set(() => ({
            routeState: {
              route: InvoiceRoute.Detail,
              mode: UpsertInvoiceMode.Update,
              invoice: invoice,
            },
          }))
        },
      },
    })),
  )

  return (
    <InvoicesRouteStoreContext.Provider value={store}>
      {props.children}
    </InvoicesRouteStoreContext.Provider>
  )
}
