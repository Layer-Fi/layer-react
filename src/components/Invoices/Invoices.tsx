import type { Awaitable } from '@internal-types/utility/promises'
import { CategoriesListMode } from '@schemas/categorization'
import { usePreloadCategories } from '@hooks/categories/useCategories'
import { InvoiceRoute, useInvoiceRouteState } from '@providers/InvoicesRouteStore/InvoicesRouteStoreProvider'
import { InvoicesProvider } from '@contexts/InvoicesContext/InvoicesContext'
import { InvoiceDetail } from '@components/Invoices/InvoiceDetail/InvoiceDetail'
import { INVOICE_MECE_TAG_DIMENSION } from '@components/Invoices/InvoiceForm/formUtils'
import { InvoiceOverview } from '@components/Invoices/InvoiceOverview/InvoiceOverview'
import { View } from '@components/View/View'
import { usePreloadCustomers } from '@features/customers/api/useListCustomers'
import { usePreloadTagDimensionByKey } from '@features/tags/api/useTagDimensionByKey'
interface InvoicesStringOverrides {
  title?: string
}

export interface InvoicesProps {
  showTitle?: boolean
  _showStripeConnectBanner?: boolean
  stringOverrides?: InvoicesStringOverrides
  onSendInvoice?: (invoiceId: string) => Awaitable<void>
}

export const Invoices = ({
  showTitle = true,
  _showStripeConnectBanner = true,
  stringOverrides,
  onSendInvoice,
}: InvoicesProps) => {
  usePreloadCustomers()
  usePreloadCategories({ mode: CategoriesListMode.Revenue })
  usePreloadTagDimensionByKey({ dimensionKey: INVOICE_MECE_TAG_DIMENSION })

  return (
    <InvoicesProvider onSendInvoice={onSendInvoice}>
      <View title={stringOverrides?.title || 'Invoices'} showHeader={showTitle}>
        <InvoicesContent _showStripeConnectBanner={_showStripeConnectBanner} />
      </View>
    </InvoicesProvider>
  )
}

interface InvoicesContentProps {
  _showStripeConnectBanner: boolean
}

const InvoicesContent = ({ _showStripeConnectBanner }: InvoicesContentProps) => {
  const routeState = useInvoiceRouteState()

  return routeState.route === InvoiceRoute.Detail
    ? <InvoiceDetail />
    : <InvoiceOverview _showStripeConnectBanner={_showStripeConnectBanner} />
}
