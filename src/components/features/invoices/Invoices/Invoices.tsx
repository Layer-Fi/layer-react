import { useTranslation } from 'react-i18next'

import { usePreloadCustomers } from '@api/businesses/[business-id]/customers/get'
import { InvoiceRoute, InvoicesRouteStoreProvider, useInvoiceRouteState } from '@providers/invoices/InvoicesRouteStore/InvoicesRouteStoreProvider'
import { View } from '@blocks/Layout/View/View'
import { InvoiceDetail } from '@features/invoices/InvoiceDetail/InvoiceDetail'
import { InvoiceOverview } from '@features/invoices/InvoiceOverview/InvoiceOverview'

interface InvoicesStringOverrides {
  title?: string
}

export interface InvoicesProps {
  stringOverrides?: InvoicesStringOverrides
}

export const Invoices = ({ stringOverrides }: InvoicesProps) => {
  const { t } = useTranslation()
  usePreloadCustomers()

  return (
    <InvoicesRouteStoreProvider>
      <View title={stringOverrides?.title || t('invoices:label.invoices', 'Invoices')}>
        <InvoicesContent />
      </View>
    </InvoicesRouteStoreProvider>
  )
}

const InvoicesContent = () => {
  const routeState = useInvoiceRouteState()

  return routeState.route === InvoiceRoute.Detail
    ? <InvoiceDetail />
    : <InvoiceOverview />
}
