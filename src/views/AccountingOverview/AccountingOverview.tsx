import { type ReactNode, useState } from 'react'
import classNames from 'classnames'

import { type OnboardingStep } from '@internal-types/layer_context'
import type { Variants } from '@utils/styleUtils/sizeVariants'
import { useSizeClass } from '@hooks/useWindowSize/useWindowSize'
import { Toggle } from '@ui/Toggle/Toggle'
import { Container } from '@components/Container/Container'
import { GlobalMonthPicker } from '@components/GlobalMonthPicker/GlobalMonthPicker'
import { Header } from '@components/Header/Header'
import { HeaderCol } from '@components/Header/HeaderCol'
import { HeaderRow } from '@components/Header/HeaderRow'
import { MileageCard } from '@components/MileageCard/MileageCard'
import { Onboarding } from '@components/Onboarding/Onboarding'
import { ProfitAndLoss } from '@components/ProfitAndLoss/ProfitAndLoss'
import { type ProfitAndLossDetailedChartsStringOverrides } from '@components/ProfitAndLossDetailedCharts/ProfitAndLossDetailedCharts'
import {
  ProfitAndLossSummaries,
  type ProfitAndLossSummariesStringOverrides,
} from '@components/ProfitAndLossSummaries/ProfitAndLossSummaries'
import { View } from '@components/View/View'
import { type TagOption } from '@views/ProjectProfitability/ProjectProfitability'

interface AccountingOverviewStringOverrides {
  title?: string
  header?: string
  profitAndLoss?: {
    detailedCharts?: ProfitAndLossDetailedChartsStringOverrides
    summaries?: ProfitAndLossSummariesStringOverrides
  }
}

export interface AccountingOverviewProps {
  /**
   * @deprecated Use `stringOverrides.title` instead
   */
  title?: string
  showTitle?: boolean
  enableOnboarding?: boolean
  onboardingStepOverride?: OnboardingStep
  onTransactionsToReviewClick?: () => void
  middleBanner?: ReactNode
  chartColorsList?: string[]
  stringOverrides?: AccountingOverviewStringOverrides
  tagFilter?: TagOption
  slotProps?: {
    profitAndLoss?: {
      summaries?: {
        variants?: Variants
      }
    }
  }
}

type PnlToggleOption = 'revenue' | 'expenses'

export const AccountingOverview = ({
  title = 'Accounting overview',
  showTitle = true,
  enableOnboarding = false,
  onboardingStepOverride = undefined,
  onTransactionsToReviewClick,
  middleBanner,
  chartColorsList,
  stringOverrides,
  tagFilter = undefined,
  slotProps,
}: AccountingOverviewProps) => {
  const [pnlToggle, setPnlToggle] = useState<PnlToggleOption>('expenses')
  const { value: sizeClass } = useSizeClass()

  const profitAndLossSummariesVariants =
    slotProps?.profitAndLoss?.summaries?.variants

  return (
    <ProfitAndLoss
      asContainer={false}
      tagFilter={
        tagFilter
          ? { key: tagFilter.tagKey, values: tagFilter.tagValues }
          : undefined
      }
    >
      <View
        title={stringOverrides?.title || title}
        showHeader={showTitle}
        header={(
          <Header>
            <HeaderRow>
              <HeaderCol>
                <GlobalMonthPicker truncateMonth={sizeClass === 'mobile'} />
              </HeaderCol>
            </HeaderRow>
          </Header>
        )}
      >
        {enableOnboarding && (
          <Onboarding
            onTransactionsToReviewClick={onTransactionsToReviewClick}
            onboardingStepOverride={onboardingStepOverride}
          />
        )}
        <ProfitAndLossSummaries
          stringOverrides={stringOverrides?.profitAndLoss?.summaries}
          chartColorsList={chartColorsList}
          onTransactionsToReviewClick={onTransactionsToReviewClick}
          variants={profitAndLossSummariesVariants}
        />
        <Container
          name='accounting-overview-profit-and-loss'
          asWidget
        >
          <ProfitAndLoss.Header
            text={stringOverrides?.header || 'Profit & Loss'}
          />
          <ProfitAndLoss.Chart
            tagFilter={
              tagFilter
                ? { key: tagFilter.tagKey, values: tagFilter.tagValues }
                : undefined
            }
          />
        </Container>
        {middleBanner && (
          <Container name='accounting-overview-middle-banner'>
            {middleBanner}
          </Container>
        )}
        <div className='Layer__accounting-overview-profit-and-loss-charts'>
          <Toggle
            ariaLabel='Chart type'
            options={[
              {
                value: 'revenue',
                label: stringOverrides?.profitAndLoss?.detailedCharts?.detailedChartStringOverrides?.revenueToggleLabel || 'Revenue',
              },
              {
                value: 'expenses',
                label: stringOverrides?.profitAndLoss?.detailedCharts?.detailedChartStringOverrides?.expenseToggleLabel || 'Expenses',
              },
            ]}
            selectedKey={pnlToggle}
            onSelectionChange={key => setPnlToggle(key as PnlToggleOption)}
          />
          <Container
            name={classNames(
              'accounting-overview-profit-and-loss-chart',
              pnlToggle !== 'revenue'
              && 'accounting-overview-profit-and-loss-chart--hidden',
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
              pnlToggle !== 'expenses'
              && 'accounting-overview-profit-and-loss-chart--hidden',
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
        <div className='Layer__accounting-overview-profit-and-loss-charts'>
          <Container name='mileage-card'>
            <MileageCard />
          </Container>
          <Container name='mileage-card'>
            <MileageCard />
          </Container>
        </div>

      </View>
    </ProfitAndLoss>
  )
}
