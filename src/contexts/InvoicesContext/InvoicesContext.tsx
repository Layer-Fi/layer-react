import { createContext, type PropsWithChildren, useContext } from 'react'
import type React from 'react'

import type { Awaitable } from '@internal-types/utility/promises'
import { InvoicesRouteStoreProvider } from '@providers/InvoicesRouteStore/InvoicesRouteStoreProvider'
import type { Invoice } from '@features/invoices/invoiceSchemas'

export interface InvoicesMenuStringOverrides {
  download?: string
  email?: string
}

export interface InvoicesStringOverrides {
  title?: string
  menu?: InvoicesMenuStringOverrides
}

type InvoicesContextProps = PropsWithChildren<{
  onSendInvoice?: (invoiceId: string) => Awaitable<void>
  onDownloadInvoice?: (invoice: Invoice) => Awaitable<void>
  onEmailInvoice?: (invoice: Invoice) => Awaitable<void>
  stringOverrides?: InvoicesStringOverrides
}>

export type InvoicesContextType = {
  onSendInvoice?: (invoiceId: string) => Awaitable<void>
  onDownloadInvoice?: (invoice: Invoice) => Awaitable<void>
  onEmailInvoice?: (invoice: Invoice) => Awaitable<void>
  stringOverrides?: InvoicesStringOverrides
}

export const InvoicesContext = createContext<InvoicesContextType>({
  onSendInvoice: () => {},
})

export const InvoicesProvider: React.FC<InvoicesContextProps> = ({
  children,
  onSendInvoice,
  onDownloadInvoice,
  onEmailInvoice,
  stringOverrides,
}) => {
  return (
    <InvoicesContext.Provider value={{ onSendInvoice, onDownloadInvoice, onEmailInvoice, stringOverrides }}>
      <InvoicesRouteStoreProvider>
        {children}
      </InvoicesRouteStoreProvider>
    </InvoicesContext.Provider>
  )
}

export const useInvoicesContext = () => useContext(InvoicesContext)
