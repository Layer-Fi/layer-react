import { createContext, type PropsWithChildren, useContext, useMemo, useState } from 'react'
import { createStore, useStore } from 'zustand'

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

export enum InvoiceDetailStep {
  Form = 'Form',
  Preview = 'Preview',
}

type InvoiceFormModeCreate = { mode: UpsertInvoiceMode.Create, isReadOnly: false }
type InvoiceFormModeUpdate = { mode: UpsertInvoiceMode.Update, invoice: Invoice, isReadOnly: boolean }

export type InvoiceFormMode = InvoiceFormModeCreate | InvoiceFormModeUpdate

type InvoiceDetailFormRouteState = {
  route: InvoiceRoute.Detail
  step: InvoiceDetailStep.Form
} & InvoiceFormMode

type InvoiceDetailPreviewRouteState = {
  route: InvoiceRoute.Detail
  step: InvoiceDetailStep.Preview
} & InvoiceFormModeUpdate

export type InvoiceDetailRouteState = InvoiceDetailFormRouteState | InvoiceDetailPreviewRouteState
type InvoiceTableRouteState = { route: InvoiceRoute.Table }
type InvoiceRouteState = InvoiceDetailRouteState | InvoiceTableRouteState

type InvoicesRouteStoreShape = {
  routeState: InvoiceRouteState
  tableFilters: InvoiceTableFilters
  setTableFilters: (patchFilters: Partial<InvoiceTableFilters>) => void
  navigate: {
    toCreateInvoice: () => void
    toEditInvoice: (invoice: Invoice) => void
    toInvoiceTable: () => void
    toPreviewInvoice: (invoice: Invoice) => void
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
      toEditInvoice: () => {},
      toInvoiceTable: () => {},
      toPreviewInvoice: () => {},
      toViewInvoice: () => {},
    },
  })),
)

const isInvoiceDetail = (routeState: InvoiceRouteState): routeState is InvoiceDetailRouteState => {
  return routeState.route === InvoiceRoute.Detail
}

const isInvoicePreview = (routeState: InvoiceRouteState): routeState is InvoiceDetailPreviewRouteState => {
  return isInvoiceDetail(routeState) && routeState.step === InvoiceDetailStep.Preview
}

export function useInvoiceRouteState() {
  const store = useContext(InvoicesRouteStoreContext)
  return useStore(store, state => state.routeState)
}

export function useInvoiceDetail(): InvoiceDetailRouteState {
  const routeState = useInvoiceRouteState()
  if (!isInvoiceDetail(routeState)) throw new Error('Invoice detail view required')

  return routeState
}

export function useInvoicePreviewRoute(): InvoiceDetailPreviewRouteState {
  const routeState = useInvoiceRouteState()
  if (!isInvoicePreview(routeState)) throw new Error('Invoice preview view required')

  return routeState
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
              step: InvoiceDetailStep.Form,
              mode: UpsertInvoiceMode.Create,
              isReadOnly: false,
            },
          }))
        },
        toEditInvoice: (invoice: Invoice) => {
          set(() => ({
            routeState: {
              route: InvoiceRoute.Detail,
              step: InvoiceDetailStep.Form,
              mode: UpsertInvoiceMode.Update,
              invoice,
              isReadOnly: false,
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
        toPreviewInvoice: (invoice: Invoice) => {
          set(() => ({
            routeState: {
              route: InvoiceRoute.Detail,
              step: InvoiceDetailStep.Preview,
              mode: UpsertInvoiceMode.Update,
              invoice,
              isReadOnly: false,
            },
          }))
        },
        toViewInvoice: (invoice: Invoice) => {
          set(() => ({
            routeState: {
              route: InvoiceRoute.Detail,
              step: InvoiceDetailStep.Form,
              mode: UpsertInvoiceMode.Update,
              invoice,
              isReadOnly: true,
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
