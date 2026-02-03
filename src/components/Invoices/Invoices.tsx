import type { Awaitable } from '@internal-types/utility/promises'
import { InvoiceRoute, useInvoiceRouteState } from '@providers/InvoicesRouteStore/InvoicesRouteStoreProvider'
import { InvoicesProvider } from '@contexts/InvoicesContext/InvoicesContext'
import { InvoiceDetail } from '@components/Invoices/InvoiceDetail/InvoiceDetail'
import { InvoiceOverview } from '@components/Invoices/InvoiceOverview/InvoiceOverview'
import { View } from '@components/View/View'
import { usePreloadCustomers } from '@features/customers/api/useListCustomers'

interface InvoicesStringOverrides {
  title?: string
}

export interface InvoicesProps {
  stringOverrides?: InvoicesStringOverrides
  onSendInvoice?: (invoiceId: string) => Awaitable<void>
}

export const Invoices = ({ stringOverrides, onSendInvoice }: InvoicesProps) => {
  usePreloadCustomers()

  return (
    <InvoicesProvider onSendInvoice={onSendInvoice}>
      <View title={stringOverrides?.title || 'Invoices'}>
        <InvoicesContent />
      </View>
    </InvoicesProvider>
  )
}

const InvoicesContent = () => {
  const routeState = useInvoiceRouteState()

  return routeState.route === InvoiceRoute.Detail
    ? <InvoiceDetail />
    : <InvoiceOverview />
}
