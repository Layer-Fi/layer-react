import React from 'react'
import { Bills } from '../../components/Bills/Bills'
import { Header } from '../../components/Container'
import { HeaderRow, HeaderCol } from '../../components/Header'
import { View } from '../../components/View'
import { BillsProvider } from '../../contexts/BillsContext'
import { BillsDatePicker } from '../../components/Bills/BillsDatePicker'

export interface BillsStringOverrides {
  title?: string
  paidToggleOption?: string
  unpaidToggleOption?: string
}

export interface ChartOfAccountsOptions {
  templateAccountsEditable?: boolean
}

export interface BillsViewProps {
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
        <Header>
          <HeaderRow>
            <HeaderCol>
              <BillsDatePicker />
            </HeaderCol>
          </HeaderRow>
        </Header>
      )}
    >
      <Bills context={false} />
    </View>
  )
}
