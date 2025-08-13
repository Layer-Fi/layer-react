import { useState, createContext, useContext, useMemo, type PropsWithChildren } from 'react'
import { createStore, useStore } from 'zustand'
import type { Invoice } from '../../features/invoices/invoiceSchemas'
import { ALL_OPTION, type InvoiceStatusOption } from '../../components/Invoices/InvoiceTable/InvoiceTable'
import type { InvoiceFormMode } from '../../components/Invoices/InvoiceForm/InvoiceForm'
import { UpsertInvoiceMode } from '../../features/invoices/api/useUpsertInvoice'

type InvoiceTableQuery = {
  status: InvoiceStatusOption
}

export enum InvoiceRoute {
  Table = 'Table',
  Detail = 'Detail',
}

type InvoiceDetailRouteState = { route: InvoiceRoute.Detail } & InvoiceFormMode
type InvoiceTableRouteState = { route: InvoiceRoute.Table }
type InvoiceRouteState = InvoiceDetailRouteState | InvoiceTableRouteState

type InvoiceStoreShape = {
  routeState: InvoiceRouteState
  tableQuery: InvoiceTableQuery
  setTableQuery: (patchQuery: Partial<InvoiceTableQuery>) => void
  navigate: {
    toCreateInvoice: () => void
    toInvoiceTable: () => void
    toViewInvoice: (invoice: Invoice) => void
  }
}

const InvoiceStoreContext = createContext(
  createStore<InvoiceStoreShape>(() => ({
    routeState: { route: InvoiceRoute.Table },
    tableQuery: { status: ALL_OPTION },
    setTableQuery: () => {},
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
  const store = useContext(InvoiceStoreContext)
  return useStore(store, state => state.routeState)
}

export function useInvoiceDetail(): InvoiceFormMode {
  const routeState = useInvoiceRouteState()
  if (!isInvoiceDetail(routeState)) throw new Error('Invoice detail view required')

  const { route, ...invoiceDetail } = routeState
  return invoiceDetail
}

export function useInvoiceTableQuery() {
  const store = useContext(InvoiceStoreContext)
  const query = useStore(store, state => state.tableQuery)
  const setQuery = useStore(store, state => state.setTableQuery)

  return useMemo(() => ({ query, setQuery }), [query, setQuery])
}

export function useInvoiceNavigation() {
  const store = useContext(InvoiceStoreContext)
  return useStore(store, state => state.navigate)
}

export function InvoiceStoreProvider(props: PropsWithChildren) {
  const [store] = useState(() =>
    createStore<InvoiceStoreShape>(set => ({
      routeState: { route: InvoiceRoute.Table },
      tableQuery: { status: ALL_OPTION },
      setTableQuery: (patchQuery: Partial<InvoiceTableQuery>) => {
        set(state => ({
          tableQuery: {
            ...state.tableQuery,
            ...patchQuery,
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
    <InvoiceStoreContext.Provider value={store}>
      {props.children}
    </InvoiceStoreContext.Provider>
  )
}
