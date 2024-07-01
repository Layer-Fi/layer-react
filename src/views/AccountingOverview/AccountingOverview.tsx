import React, { useState } from 'react'
import { Container, Header } from '../../components/Container'
import { Onboarding } from '../../components/Onboarding'
import { ProfitAndLoss } from '../../components/ProfitAndLoss'
import { Toggle } from '../../components/Toggle'
import { TransactionToReviewCard } from '../../components/TransactionToReviewCard'
import { Heading, HeadingSize } from '../../components/Typography'
import { View } from '../../components/View'
import classNames from 'classnames'
import { PeriodPicker } from '../../components/PeriodPicker'
import { PeriodPickerOption } from '../../components/PeriodPicker/PeriodPicker'

export interface AccountingOverviewProps {
  title?: string
  enableOnboarding?: boolean
  onTransactionsToReviewClick?: () => void
}

type PnlToggleOption = 'revenue' | 'expenses'

export const AccountingOverview = ({
  title = 'Accounting overview',
  enableOnboarding = false,
  onTransactionsToReviewClick,
}: AccountingOverviewProps) => {
  const [pnlToggle, setPnlToggle] = useState<PnlToggleOption>('revenue')

  const [selectedPeriod, setSelectedPeriod] = useState<{
    key: PeriodPickerOption
    start_date: string
    end_date: string
  }>({
    key: 'month',
    start_date: '',
    end_date: '',
  })

  const handlePeriodSelect = (option: {
    key: PeriodPickerOption
    start_date: string
    end_date: string
  }) => {
    setSelectedPeriod(option)
  }

  return (
    <ProfitAndLoss asContainer={false}>
      <View title={title} headerControls={<ProfitAndLoss.DatePicker />}>
        {enableOnboarding && (
          <Onboarding
            onTransactionsToReviewClick={onTransactionsToReviewClick}
          />
        )}
        <div className='Layer__accounting-overview__summaries-row'>
          <ProfitAndLoss.Summaries actionable={false} />
          <TransactionToReviewCard
            usePnlDateRange={true}
            onClick={onTransactionsToReviewClick}
          />
        </div>
        <PeriodPicker onSelect={handlePeriodSelect} defaultValue='month' />
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
            onChange={(e) => setPnlToggle(e.target.value as PnlToggleOption)}
          />
          <Container
            name={classNames(
              'accounting-overview-profit-and-loss-chart',
              pnlToggle !== 'revenue' &&
                'accounting-overview-profit-and-loss-chart--hidden'
            )}
          >
            <ProfitAndLoss.DetailedCharts scope='revenue' hideClose={true} />
          </Container>
          <Container
            name={classNames(
              'accounting-overview-profit-and-loss-chart',
              pnlToggle !== 'expenses' &&
                'accounting-overview-profit-and-loss-chart--hidden'
            )}
          >
            <ProfitAndLoss.DetailedCharts scope='expenses' hideClose={true} />
          </Container>
        </div>
      </View>
    </ProfitAndLoss>
  )
}
