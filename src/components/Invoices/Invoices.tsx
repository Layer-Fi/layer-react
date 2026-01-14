import type { Awaitable } from '@internal-types/utility/promises'
import { CategoriesListMode } from '@schemas/categorization'
import { usePreloadCategories } from '@hooks/categories/useCategories'
import { InvoiceRoute, useInvoiceRouteState } from '@providers/InvoicesRouteStore/InvoicesRouteStoreProvider'
import { InvoicesProvider, type InvoicesStringOverrides } from '@contexts/InvoicesContext/InvoicesContext'
import { InvoiceDetail } from '@components/Invoices/InvoiceDetail/InvoiceDetail'
import { INVOICE_MECE_TAG_DIMENSION } from '@components/Invoices/InvoiceForm/formUtils'
import { InvoiceOverview } from '@components/Invoices/InvoiceOverview/InvoiceOverview'
import { View } from '@components/View/View'
import { usePreloadCustomers } from '@features/customers/api/useListCustomers'
import type { Invoice } from '@features/invoices/invoiceSchemas'
import { usePreloadTagDimensionByKey } from '@features/tags/api/useTagDimensionByKey'

export type { InvoicesStringOverrides } from '@contexts/InvoicesContext/InvoicesContext'

export interface InvoicesProps {
  showTitle?: boolean
  stringOverrides?: InvoicesStringOverrides
  onSendInvoice?: (invoiceId: string) => Awaitable<void>
  onDownloadInvoice?: (invoice: Invoice) => Awaitable<void>
  onEmailInvoice?: (invoice: Invoice) => Awaitable<void>
}

export const Invoices = ({
  showTitle = true,
  stringOverrides,
  onSendInvoice,
  onDownloadInvoice,
  onEmailInvoice,
}: InvoicesProps) => {
  usePreloadCustomers()
  usePreloadCategories({ mode: CategoriesListMode.Revenue })
  usePreloadTagDimensionByKey({ dimensionKey: INVOICE_MECE_TAG_DIMENSION })

  return (
    <InvoicesProvider
      onSendInvoice={onSendInvoice}
      onDownloadInvoice={onDownloadInvoice}
      onEmailInvoice={onEmailInvoice}
      stringOverrides={stringOverrides}
    >
      <View title={stringOverrides?.title || 'Invoices'} showHeader={showTitle}>
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
