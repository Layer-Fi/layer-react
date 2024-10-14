import React, { useState } from 'react'
import { Bills } from '../../components/Bills'
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
  const [activeTab, setActiveTab] = useState('unpaid')

  return (
    <View
      title={stringOverrides?.title || 'Bills'}
      showHeader={showTitle}
      viewClassName='Layer__bills__view'
      header={
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
      }
    >
      <Bills activeTab={activeTab} setActiveTab={setActiveTab} />
    </View>
  )
}
