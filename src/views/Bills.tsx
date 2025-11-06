import { Bills } from '@components/Bills/Bills'
import { View } from '@components/View/View'
import { BillsProvider } from '@contexts/BillsContext'

export type BillsStringOverrides = {
  title?: string
  paidToggleOption?: string
  unpaidToggleOption?: string
}

export type ChartOfAccountsOptions = {
  templateAccountsEditable?: boolean
}

export type BillsViewProps = {
  showTitle?: boolean
  stringOverrides?: BillsStringOverrides
}

export const unstable_BillsView = (props: BillsViewProps) => (
  <BillsProvider>
    <BillsViewContent {...props} />
  </BillsProvider>
)

const BillsViewContent = ({
  showTitle = true,
  stringOverrides,
}: Omit<BillsViewProps, 'context'>) => {
  return (
    <View
      title={stringOverrides?.title || 'Bills'}
      showHeader={showTitle}
      viewClassName='Layer__bills__view'
    >
      <Bills context={false} />
    </View>
  )
}
