import { View } from '@components/View/View'
import { InvoiceRoute, useInvoiceRouteState } from '@providers/InvoicesRouteStore/InvoicesRouteStoreProvider'
import { InvoiceDetail } from '@components/Invoices/InvoiceDetail/InvoiceDetail'
import { InvoiceOverview } from '@components/Invoices/InvoiceOverview/InvoiceOverview'
import { usePreloadCustomers } from '@features/customers/api/useListCustomers'
import { usePreloadCategories } from '@hooks/categories/useCategories'
import { CategoriesListMode } from '@schemas/categorization'
import { usePreloadTagDimensionByKey } from '@features/tags/api/useTagDimensionByKey'
import { INVOICE_MECE_TAG_DIMENSION } from '@components/Invoices/InvoiceForm/formUtils'
import type { Awaitable } from '@internal-types/utility/promises'
import { InvoicesProvider } from '@contexts/InvoicesContext/InvoicesContext'
interface InvoicesStringOverrides {
  title?: string
}

export interface InvoicesProps {
  showTitle?: boolean
  stringOverrides?: InvoicesStringOverrides
  onSendInvoice?: (invoiceId: string) => Awaitable<void>
}

export const Invoices = ({ showTitle = true, stringOverrides, onSendInvoice }: InvoicesProps) => {
  usePreloadCustomers()
  usePreloadCategories({ mode: CategoriesListMode.Revenue })
  usePreloadTagDimensionByKey({ dimensionKey: INVOICE_MECE_TAG_DIMENSION })

  return (
    <InvoicesProvider onSendInvoice={onSendInvoice}>
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
