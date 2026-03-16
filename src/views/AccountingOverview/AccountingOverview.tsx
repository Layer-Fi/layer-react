import { type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

import { type OnboardingStep } from '@internal-types/layerContext'
import type { Variants } from '@utils/styleUtils/sizeVariants'
import { useSizeClass } from '@hooks/utils/size/useWindowSize'
import { Container } from '@components/Container/Container'
import { GlobalMonthPicker } from '@components/GlobalMonthPicker/GlobalMonthPicker'
import { Header } from '@components/Header/Header'
import { HeaderCol } from '@components/Header/HeaderCol'
import { HeaderRow } from '@components/Header/HeaderRow'
import { Onboarding } from '@components/Onboarding/Onboarding'
import { ProfitAndLoss } from '@components/ProfitAndLoss/ProfitAndLoss'
import { type ProfitAndLossDetailedChartsStringOverrides } from '@components/ProfitAndLossDetailedCharts/ProfitAndLossDetailedCharts'
import { ProfitAndLossOverviewDetailedCharts } from '@components/ProfitAndLossOverviewDetailedCharts/ProfitAndLossOverviewDetailedCharts'
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

export const AccountingOverview = ({
  title,
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
  const { t } = useTranslation()
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
        title={stringOverrides?.title || title || t('accountingOverview', 'Accounting overview')}
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
            text={stringOverrides?.header || t('profitLoss', 'Profit & Loss')}
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
        <ProfitAndLossOverviewDetailedCharts
          variant='accounting'
          detailedChartsStringOverrides={stringOverrides?.profitAndLoss?.detailedCharts}
          chartColorsList={chartColorsList}
        />
      </View>
    </ProfitAndLoss>
  )
}
