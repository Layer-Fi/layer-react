import React from 'react'
import { Bills } from '../../components/Bills/Bills'
import { Header } from '../../components/Container'
import { DatePicker } from '../../components/DatePicker'
import { HeaderRow, HeaderCol } from '../../components/Header'
import { View } from '../../components/View'

export interface BillsStringOverrides {
  title?: string
  paidToggleOption?: string
  unpaidToggleOption?: string
}

export interface ChartOfAccountsOptions {
  templateAccountsEditable?: boolean
}

export interface BillsProps {
  showTitle?: boolean
  stringOverrides?: BillsStringOverrides
}

export const BillsView = ({
  showTitle = true,
  stringOverrides,
}: BillsProps) => {
  return (
    <View
      title={stringOverrides?.title || 'Bills'}
      showHeader={showTitle}
      viewClassName='Layer__bills__view'
      header={(
        <Header>
          <HeaderRow>
            <HeaderCol>
              <DatePicker
                mode='monthRangePicker'
                selected={new Date()}
                onChange={() => {}}
                wrapperClassName='Layer__bills__main-datepicker'
              />
            </HeaderCol>
          </HeaderRow>
        </Header>
      )}
    >
      <Bills />
    </View>
  )
}
