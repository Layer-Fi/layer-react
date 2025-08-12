import { View } from '../../components/View'
import { InvoiceRoute, InvoiceStoreProvider, useInvoiceRouteState } from '../../providers/InvoicesProvider/InvoicesProvider'
import { InvoiceDetail } from './InvoiceDetail/InvoiceDetail'
import { InvoicesTable } from './InvoicesTable/InvoicesTable'

interface InvoicesStringOverrides {
  title?: string
}

export interface InvoicesProps {
  showTitle?: boolean
  stringOverrides?: InvoicesStringOverrides
}

export const unstable_Invoices = ({ showTitle = true, stringOverrides }: InvoicesProps) => {
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
    : <InvoicesTable />
}
