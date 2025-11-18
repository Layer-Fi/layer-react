import { createContext, type PropsWithChildren, useContext } from 'react'
import type React from 'react'

import type { Awaitable } from '@internal-types/utility/promises'
import { InvoicesRouteStoreProvider } from '@providers/InvoicesRouteStore/InvoicesRouteStoreProvider'

type InvoicesContextProps = PropsWithChildren<{
  onSendInvoice?: (invoiceId: string) => Awaitable<void>
}>

export type InvoicesContextType = {
  onSendInvoice?: (invoiceId: string) => Awaitable<void>
}

export const InvoicesContext = createContext<InvoicesContextType>({
  onSendInvoice: () => {},
})

export const InvoicesProvider: React.FC<InvoicesContextProps> = ({ children, onSendInvoice }) => {
  return (
    <InvoicesContext.Provider value={{ onSendInvoice }}>
      <InvoicesRouteStoreProvider>
        {children}
      </InvoicesRouteStoreProvider>
    </InvoicesContext.Provider>
  )
}

export const useInvoicesContext = () => useContext(InvoicesContext)
