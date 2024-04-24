import React from 'react'
import { ProfitAndLoss } from '../../components/ProfitAndLoss'
import { ProfitAndLossDetailedCharts } from '../../components/ProfitAndLossDetailedCharts'
import { Heading, HeadingSize } from '../../components/Typography'
import { View } from '../../components/View'

export interface AccountingOverviewProps {
  title?: string
}

export const AccountingOverview = ({
  title = 'Accounting overview',
}: AccountingOverviewProps) => {
  return (
    <ProfitAndLoss asContainer={false}>
      <View title={title} headerControls={<ProfitAndLoss.DatePicker />}>
        <ProfitAndLoss.Summaries />
        <div className='Layer__component-container' style={{ padding: 16 }}>
          <Heading size={HeadingSize.secondary}>Profit & Loss</Heading>
          <ProfitAndLoss.Chart />
        </div>
        <div style={{ display: 'flex' }}>
          <ProfitAndLossDetailedCharts />
          <ProfitAndLossDetailedCharts />
        </div>
      </View>
    </ProfitAndLoss>
  )
}
