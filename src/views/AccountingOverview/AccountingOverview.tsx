import { type ReactNode, useState } from 'react'
import classNames from 'classnames'

import { type OnboardingStep } from '@internal-types/layer_context'
import type { Variants } from '@utils/styleUtils/sizeVariants'
import { useGlobalDateMode } from '@providers/GlobalDateStore/GlobalDateStoreProvider'
import { HStack } from '@ui/Stack/Stack'
import { Toggle } from '@ui/Toggle/Toggle'
import { Container } from '@components/Container/Container'
import { CombinedDateRangeSelection } from '@components/DateSelection/CombinedDateRangeSelection'
import { GlobalDateModeToggle } from '@components/DateSelection/GlobalDateModeToggle'
import { Header } from '@components/Header/Header'
import { HeaderCol } from '@components/Header/HeaderCol'
import { HeaderRow } from '@components/Header/HeaderRow'
import { Onboarding } from '@components/Onboarding/Onboarding'
import {
  PnLHorizontalBarChart,
  PnLHorizontalBarChartLegend,
} from '@components/PnLHorizontalBarChart/PnLHorizontalBarChart'
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
  const dateSelectionMode = useGlobalDateMode()

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
        viewClassName={classNames(
          'Layer__AccountingOverviewView',
          dateSelectionMode === 'full' && 'Layer__AccountingOverviewView--range',
        )}
        header={(
          <Header>
            <HeaderRow>
              <HeaderCol fluid>
                <HStack
                  className={classNames(
                    'Layer__AccountingOverview__DateControls',
                    dateSelectionMode === 'full' && 'Layer__AccountingOverview__DateControls--range',
                  )}
                  gap='xs'
                  align='center'
                  justify='end'
                >
                  <HStack
                    className='Layer__AccountingOverview__DateControls__DateSelection'
                    justify='end'
                  >
                    <CombinedDateRangeSelection
                      mode={dateSelectionMode}
                      showLabels={false}
                    />
                  </HStack>
                  <GlobalDateModeToggle />
                </HStack>
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
        {dateSelectionMode === 'month'
          ? (
            <>
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
            </>
          )
          : (
            <Container
              name='PnLHorizontalBarChart'
              asWidget
            >
              <ProfitAndLoss.Header
                text={stringOverrides?.header || 'Profit & Loss'}
                rightContent={<PnLHorizontalBarChartLegend />}
              />
              <PnLHorizontalBarChart onTransactionsToReviewClick={onTransactionsToReviewClick} />
            </Container>
          )}
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
      </View>
    </ProfitAndLoss>
  )
}
