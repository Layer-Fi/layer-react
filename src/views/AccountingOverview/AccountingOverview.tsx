import React, { ReactNode, useState } from 'react'
import { Container } from '../../components/Container'
import { Onboarding } from '../../components/Onboarding'
import { ProfitAndLoss } from '../../components/ProfitAndLoss'
import { ProfitAndLossDetailedChartsStringOverrides } from '../../components/ProfitAndLossDetailedCharts/ProfitAndLossDetailedCharts'
import { ProfitAndLossSummariesStringOverrides } from '../../components/ProfitAndLossSummaries/ProfitAndLossSummaries'
import { Toggle } from '../../components/Toggle'
import { TransactionToReviewCard } from '../../components/TransactionToReviewCard'
import { View } from '../../components/View'
import classNames from 'classnames'

interface AccountingOverviewStringOverrides {
  header?: string
  profitAndLoss?: {
    detailedCharts?: ProfitAndLossDetailedChartsStringOverrides
    summaries?: ProfitAndLossSummariesStringOverrides
  }
}

export interface AccountingOverviewProps {
  title?: string
  enableOnboarding?: boolean
  onTransactionsToReviewClick?: () => void
  middleBanner?: ReactNode
  chartColorsList?: string[]
  stringOverrides?: AccountingOverviewStringOverrides
}

type PnlToggleOption = 'revenue' | 'expenses'

export const AccountingOverview = ({
  title = 'Accounting overview',
  enableOnboarding = false,
  onTransactionsToReviewClick,
  middleBanner,
  chartColorsList,
  stringOverrides,
}: AccountingOverviewProps) => {
  const [pnlToggle, setPnlToggle] = useState<PnlToggleOption>('expenses')

  return (
    <ProfitAndLoss asContainer={false}>
      <View title={title} headerControls={<ProfitAndLoss.DatePicker />}>
        {enableOnboarding && (
          <Onboarding
            onTransactionsToReviewClick={onTransactionsToReviewClick}
          />
        )}
        <div className='Layer__accounting-overview__summaries-row'>
          <ProfitAndLoss.Summaries
            stringOverrides={stringOverrides?.profitAndLoss?.summaries}
            showUncategorized
          />
          <TransactionToReviewCard
            usePnlDateRange={true}
            onClick={onTransactionsToReviewClick}
            hideWhenNoTransactions
            size='large'
          />
        </div>
        <Container
          name='accounting-overview-profit-and-loss'
          asWidget
          elevated={true}
        >
          <ProfitAndLoss.Header
            text={stringOverrides?.header || 'Profit & Loss'}
          />
          <ProfitAndLoss.Chart />
        </Container>
        {middleBanner && (
          <Container name='accounting-overview-middle-banner'>
            {middleBanner}
          </Container>
        )}
        <div className='Layer__accounting-overview-profit-and-loss-charts'>
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
              'accounting-overview-profit-and-loss-chart',
              pnlToggle !== 'revenue' &&
                'accounting-overview-profit-and-loss-chart--hidden',
            )}
          >
            <ProfitAndLoss.DetailedCharts
              scope='revenue'
              hideClose={true}
              stringOverrides={stringOverrides?.profitAndLoss?.detailedCharts}
              chartColorsList={chartColorsList}
            />
          </Container>
          <Container
            name={classNames(
              'accounting-overview-profit-and-loss-chart',
              pnlToggle !== 'expenses' &&
                'accounting-overview-profit-and-loss-chart--hidden',
            )}
          >
            <ProfitAndLoss.DetailedCharts
              scope='expenses'
              hideClose={true}
              stringOverrides={stringOverrides?.profitAndLoss?.detailedCharts}
              chartColorsList={chartColorsList}
            />
          </Container>
        </div>
      </View>
    </ProfitAndLoss>
  )
}
