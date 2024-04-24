import React from 'react'
import { ProfitAndLoss } from '../../components/ProfitAndLoss'
import { View } from '../../components/View'

export interface ReportsProps {
  title?: string
}

export const Reports = ({ title = 'Reports' }: ReportsProps) => {
  return (
    <ProfitAndLoss asContainer={false}>
      <View title={title} headerControls={<ProfitAndLoss.DatePicker />}>
        <ProfitAndLoss.Table asContainer={true} />
      </View>
    </ProfitAndLoss>
  )
}
