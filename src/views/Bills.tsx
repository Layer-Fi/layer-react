import { Bills } from '../components/Bills/Bills'
import { HeaderRow, HeaderCol } from '../components/Header'
import { View } from '../components/View'
import { BillsProvider } from '../contexts/BillsContext'
import { BillsDatePicker } from '../components/Bills/BillsDatePicker'

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

export const BillsView = (props: BillsViewProps) => (
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
      header={(
        <HeaderRow>
          <HeaderCol>
            <BillsDatePicker />
          </HeaderCol>
        </HeaderRow>
      )}
    >
      <Bills context={false} />
    </View>
  )
}
