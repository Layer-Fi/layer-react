import { View } from '../../components/View'
import { InvoicesTable } from './InvoiceTable'

interface InvoicesStringOverrides {
  title?: string
}

export interface InvoicesProps {
  showTitle?: boolean
  stringOverrides?: InvoicesStringOverrides
}

export const Invoices = ({
  showTitle = true,
  stringOverrides,
}: InvoicesProps) => {
  return (
    <View
      title={stringOverrides?.title || 'Invoices'}
      showHeader={showTitle}
    >
      <InvoicesTable />
    </View>
  )
}
