import React, { useState } from 'react'
import { Container, Header } from '../../components/Container'
import { Onboarding } from '../../components/Onboarding'
import { ProfitAndLoss } from '../../components/ProfitAndLoss'
import { Tasks } from '../../components/Tasks'
import { Toggle } from '../../components/Toggle'
import { TransactionToReviewCard } from '../../components/TransactionToReviewCard'
import { Heading, HeadingSize } from '../../components/Typography'
import { View } from '../../components/View'
import { useSizeClass } from '../../hooks/useWindowSize'
import classNames from 'classnames'

export interface BookkeepingOverviewProps {
  title?: string
  enableOnboarding?: boolean
  onTransactionsToReviewClick?: () => void
}

type PnlToggleOption = 'revenue' | 'expenses'

export const BookkeepingOverview = ({
  title = 'Bookkeeping overview',
  enableOnboarding = false,
  onTransactionsToReviewClick,
}: BookkeepingOverviewProps) => {
  const [pnlToggle, setPnlToggle] = useState<PnlToggleOption>('revenue')
  const { isDesktop } = useSizeClass()

  return (
    <ProfitAndLoss asContainer={false}>
      <View
        title={title}
        headerControls={<ProfitAndLoss.DatePicker />}
        withSidebar={isDesktop}
        sidebar={<Tasks asContainer={false} />}
      >
        {!isDesktop && <Tasks asContainer={true} />}
        {enableOnboarding && (
          <Onboarding
            onTransactionsToReviewClick={onTransactionsToReviewClick}
          />
        )}
        <div className='Layer__bookkeeping-overview__summaries-row'>
          <ProfitAndLoss.Summaries actionable={false} />
          <TransactionToReviewCard
            usePnlDateRange={true}
            onClick={onTransactionsToReviewClick}
          />
        </div>
        <Container
          name='bookkeeping-overview-profit-and-loss'
          asWidget
          elevated={true}
        >
          <Header>
            <Heading size={HeadingSize.secondary}>Profit & Loss</Heading>
          </Header>
          <ProfitAndLoss.Chart />
        </Container>
        <div className='Layer__bookkeeping-overview-profit-and-loss-charts'>
          <Toggle
            name='pnl-detailed-charts'
            options={[
              {
                value: 'revenue',
                label: 'Revenue',
              },
              {
                value: 'expenses',
                label: 'Expenses',
              },
            ]}
            selected={pnlToggle}
            onChange={e => setPnlToggle(e.target.value as PnlToggleOption)}
          />
          <Container
            name={classNames(
              'bookkeeping-overview-profit-and-loss-chart',
              pnlToggle !== 'revenue' &&
                'bookkeeping-overview-profit-and-loss-chart--hidden',
            )}
          >
            <ProfitAndLoss.DetailedCharts scope='revenue' hideClose={true} />
          </Container>
          <Container
            name={classNames(
              'bookkeeping-overview-profit-and-loss-chart',
              pnlToggle !== 'expenses' &&
                'bookkeeping-overview-profit-and-loss-chart--hidden',
            )}
          >
            <ProfitAndLoss.DetailedCharts scope='expenses' hideClose={true} />
          </Container>
        </div>
      </View>
    </ProfitAndLoss>
  )
}
