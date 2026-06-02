import { useTranslation } from 'react-i18next'

import { usePreloadCustomers } from '@hooks/api/businesses/[business-id]/customers/useListCustomers'
import { InvoiceRoute, InvoicesRouteStoreProvider, useInvoiceRouteState } from '@providers/InvoicesRouteStore/InvoicesRouteStoreProvider'
import { InvoiceDetail } from '@components/Invoices/InvoiceDetail/InvoiceDetail'
import { InvoiceOverview } from '@components/Invoices/InvoiceOverview/InvoiceOverview'
import { View } from '@components/View/View'

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
