import { View } from '../../components/View'
import { InvoicesTable } from './InvoicesTable'

interface InvoicesStringOverrides {
  title?: string
}

export interface InvoicesProps {
  showTitle?: boolean
  stringOverrides?: InvoicesStringOverrides
}

export const unstable_Invoices = ({
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
