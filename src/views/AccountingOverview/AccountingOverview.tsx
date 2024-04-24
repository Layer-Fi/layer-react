import React from 'react'
import { Container, Header } from '../../components/Container'
import { ProfitAndLoss } from '../../components/ProfitAndLoss'
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
        <Container name='accounting-overview-profit-and-loss' asWidget>
          <Header>
            <Heading size={HeadingSize.secondary}>Profit & Loss</Heading>
          </Header>
          <ProfitAndLoss.Chart />
        </Container>
        <div className='accounting-overview-profit-and-loss-charts'>
          <Container name='accounting-overview-profit-and-loss-chart'>
            <ProfitAndLoss.DetailedCharts scope='revenue' hideClose={true} />
          </Container>
          <Container name='accounting-overview-profit-and-loss-chart'>
            <ProfitAndLoss.DetailedCharts scope='expenses' hideClose={true} />
          </Container>
        </div>
      </View>
    </ProfitAndLoss>
  )
}
