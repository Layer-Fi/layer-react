import { View } from '../../components/View'
import { InvoiceRoute, InvoiceStoreProvider, useInvoiceRouteState } from '../../providers/InvoiceStore/InvoiceStoreProvider'
import { InvoiceDetail } from './InvoiceDetail/InvoiceDetail'
import { InvoiceOverview } from './InvoiceOverview/InvoiceOverview'
import { usePreloadCustomers } from '../../features/customers/api/useListCustomers'
import { usePreloadCategories } from '../../hooks/categories/useCategories'
import { CategoriesListMode } from '../../types/categories'
import { usePreloadTagDimensionByKey } from '../../features/tags/api/useTagDimensionByKey'
import { INVOICE_MECE_TAG_DIMENSION } from './InvoiceForm/formUtils'
interface InvoicesStringOverrides {
  title?: string
}

export interface InvoicesProps {
  showTitle?: boolean
  stringOverrides?: InvoicesStringOverrides
}

export const Invoices = ({ showTitle = true, stringOverrides }: InvoicesProps) => {
  usePreloadCustomers()
  usePreloadCategories({ mode: CategoriesListMode.Revenue })
  usePreloadTagDimensionByKey({ dimensionKey: INVOICE_MECE_TAG_DIMENSION })

  return (
    <InvoiceStoreProvider>
      <View title={stringOverrides?.title || 'Invoices'} showHeader={showTitle}>
        <InvoicesContent />
      </View>
    </InvoiceStoreProvider>
  )
}

const InvoicesContent = () => {
  const routeState = useInvoiceRouteState()

  return routeState.route === InvoiceRoute.Detail
    ? <InvoiceDetail />
    : <InvoiceOverview />
}
