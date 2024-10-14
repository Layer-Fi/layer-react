import React, { ReactNode, useState } from 'react'
import { Button } from '../../components/Button'
import { Container } from '../../components/Container'
import { Header, HeaderCol, HeaderRow } from '../../components/Header'
import { Onboarding } from '../../components/Onboarding'
import { ProfitAndLoss } from '../../components/ProfitAndLoss'
import { ProfitAndLossChartOpacity } from '../../components/ProfitAndLossChart/ProfitAndLossChartOpacity'
import { ProfitAndLossChartToggling } from '../../components/ProfitAndLossChart/ProfitAndLossChartToggling'
import { ProfitAndLossChartWideSelection } from '../../components/ProfitAndLossChart/ProfitAndLossChartWideSelection'
import { ProfitAndLossDetailedChartsStringOverrides } from '../../components/ProfitAndLossDetailedCharts/ProfitAndLossDetailedCharts'
import { ProfitAndLossSummariesStringOverrides } from '../../components/ProfitAndLossSummaries/ProfitAndLossSummaries'
import { Toggle } from '../../components/Toggle'
import { TransactionToReviewCard } from '../../components/TransactionToReviewCard'
import { View } from '../../components/View'
import {
  Period,
  useProfitAndLossLTM,
} from '../../hooks/useProfitAndLoss/useProfitAndLossLTM'
import { OnboardingStep } from '../../types/layer_context'
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
  showTitle?: boolean
  enableOnboarding?: boolean
  onboardingStepOverride?: OnboardingStep
  onTransactionsToReviewClick?: () => void
  middleBanner?: ReactNode
  chartColorsList?: string[]
  stringOverrides?: AccountingOverviewStringOverrides
}

type PnlToggleOption = 'revenue' | 'expenses'

const Charts = () => {
  return (
    <>
      <Container
        name='accounting-overview-profit-and-loss'
        asWidget
        elevated={true}
      >
        <ProfitAndLoss.Header text={'Profit & Loss'} />
        <ProfitAndLoss.Chart />
      </Container>

      <Container
        name='accounting-overview-profit-and-loss'
        asWidget
        elevated={true}
      >
        <ProfitAndLossChartOpacity />
      </Container>
      <Container
        name='accounting-overview-profit-and-loss'
        asWidget
        elevated={true}
      >
        <ProfitAndLossChartWideSelection />
      </Container>
      <Container
        name='accounting-overview-profit-and-loss'
        asWidget
        elevated={true}
      >
        <ProfitAndLossChartToggling />
      </Container>
    </>
  )
}

export const AccountingOverview = ({
  title = 'Accounting overview',
  showTitle = true,
  enableOnboarding = false,
  onboardingStepOverride = undefined,
  onTransactionsToReviewClick,
  middleBanner,
  chartColorsList,
  stringOverrides,
}: AccountingOverviewProps) => {
  const [pnlToggle, setPnlToggle] = useState<PnlToggleOption>('expenses')

  return (
    <ProfitAndLoss asContainer={false}>
      <View
        title={title}
        showHeader={showTitle}
        header={
          <Header>
            <HeaderRow>
              <HeaderCol>
                <ProfitAndLoss.DatePicker />
              </HeaderCol>
            </HeaderRow>
          </Header>
        }
      >
        {enableOnboarding && (
          <Onboarding
            onTransactionsToReviewClick={onTransactionsToReviewClick}
            onboardingStepOverride={onboardingStepOverride}
          />
        )}
        <div className='Layer__accounting-overview__summaries-row'>
          <ProfitAndLoss.Summaries
            stringOverrides={stringOverrides?.profitAndLoss?.summaries}
          />
          <TransactionToReviewCard
            usePnlDateRange={true}
            onClick={onTransactionsToReviewClick}
          />
        </div>
        <Charts />
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
