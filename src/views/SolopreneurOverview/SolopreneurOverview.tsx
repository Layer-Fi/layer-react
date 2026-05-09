import { type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

import { type OnboardingStep } from '@internal-types/layerContext'
import type { Variants } from '@utils/styleUtils/sizeVariants'
import { useSizeClass } from '@hooks/utils/size/useWindowSize'
import { ExpensesSummaryCard } from '@components/ExpensesSummaryCard/ExpensesSummaryCard'
import { GlobalMonthPicker } from '@components/GlobalMonthPicker/GlobalMonthPicker'
import { Header } from '@components/Header/Header'
import { HeaderCol } from '@components/Header/HeaderCol'
import { HeaderRow } from '@components/Header/HeaderRow'
import { MileageTrackingSummary } from '@components/MileageTrackingSummary/MileageTrackingSummary'
import { Onboarding } from '@components/Onboarding/Onboarding'
import { ProfitAndLoss } from '@components/ProfitAndLoss/ProfitAndLoss'
import {
  ProfitAndLossSummaries,
  type ProfitAndLossSummariesStringOverrides,
} from '@components/ProfitAndLossSummaries/ProfitAndLossSummaries'
import { ProfitAndLossSummaryCard } from '@components/ProfitAndLossSummaryCard/ProfitAndLossSummaryCard'
import {
  TaxEstimatesSummaryCard,
  TaxEstimatesSummaryCardMode,
} from '@components/TaxEstimatesSummaryCard/TaxEstimatesSummaryCard'
import { View } from '@components/View/View'
import { type TagOption } from '@views/ProjectProfitability/ProjectProfitability'

import './solopreneurOverview.scss'

type CardStringOverrides = {
  header?: string
}

interface SolopreneurOverviewStringOverrides {
  title?: string
  profitAndLossSummaries?: ProfitAndLossSummariesStringOverrides
  cards?: {
    profitAndLoss?: CardStringOverrides
    expenses?: CardStringOverrides
    taxEstimates?: CardStringOverrides
    mileageTracking?: CardStringOverrides
  }
}

export interface SolopreneurOverviewProps {
  showTitle?: boolean
  enableOnboarding?: boolean
  onboardingStepOverride?: OnboardingStep
  onTransactionsToReviewClick?: () => void
  middleBanner?: ReactNode
  chartColorsList?: string[]
  stringOverrides?: SolopreneurOverviewStringOverrides
  tagFilter?: TagOption
  slotProps?: {
    profitAndLoss?: {
      summaries?: {
        variants?: Variants
      }
    }
  }
}

export const SolopreneurOverview = ({
  showTitle = true,
  enableOnboarding = false,
  onboardingStepOverride = undefined,
  onTransactionsToReviewClick,
  middleBanner,
  chartColorsList,
  stringOverrides,
  tagFilter = undefined,
  slotProps,
}: SolopreneurOverviewProps) => {
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
        title={stringOverrides?.title || t('overview:label.solopreneur_overview', 'Overview')}
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
          stringOverrides={stringOverrides?.profitAndLossSummaries}
          chartColorsList={chartColorsList}
          onTransactionsToReviewClick={onTransactionsToReviewClick}
          variants={profitAndLossSummariesVariants}
        />
        {middleBanner}
        <div className='Layer__SolopreneurOverview__Grid'>
          <ProfitAndLossSummaryCard
            stringOverrides={{ title: stringOverrides?.cards?.profitAndLoss?.header }}
          />
          <ExpensesSummaryCard
            stylingProps={{ chartColorsList }}
            stringOverrides={{ title: stringOverrides?.cards?.expenses?.header }}
          />
          <TaxEstimatesSummaryCard
            mode={TaxEstimatesSummaryCardMode.HorizontalBarChart}
            withHeaderSeparator
            title={stringOverrides?.cards?.taxEstimates?.header}
          />
          <MileageTrackingSummary {...stringOverrides?.cards?.mileageTracking} />
        </div>
      </View>
    </ProfitAndLoss>
  )
}
