import React from 'react'
import { Container, Header } from '../../components/Container'
import { Onboarding } from '../../components/Onboarding'
import { ProfitAndLoss } from '../../components/ProfitAndLoss'
import { Heading, HeadingSize } from '../../components/Typography'
import { View } from '../../components/View'

export interface AccountingOverviewProps {
  title?: string
  enableOnboarding?: boolean
}

export const AccountingOverview = ({
  title = 'Accounting overview',
  enableOnboarding = false,
}: AccountingOverviewProps) => {
  return (
    <ProfitAndLoss asContainer={false}>
      <View title={title} headerControls={<ProfitAndLoss.DatePicker />}>
        {enableOnboarding && <Onboarding />}
        <ProfitAndLoss.Summaries actionable={false} />
        <Container
          name='accounting-overview-profit-and-loss'
          asWidget
          elevated={true}
        >
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
