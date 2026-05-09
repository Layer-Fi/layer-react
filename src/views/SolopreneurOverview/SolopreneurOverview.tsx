<<<<<<< HEAD
import { type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

import { type OnboardingStep } from '@internal-types/layerContext'
import type { Variants } from '@utils/styleUtils/sizeVariants'
=======
import { useTranslation } from 'react-i18next'

>>>>>>> main
import { useSizeClass } from '@hooks/utils/size/useWindowSize'
import { ExpensesSummaryCard } from '@components/ExpensesSummaryCard/ExpensesSummaryCard'
import { GlobalMonthPicker } from '@components/GlobalMonthPicker/GlobalMonthPicker'
import { Header } from '@components/Header/Header'
import { HeaderCol } from '@components/Header/HeaderCol'
import { HeaderRow } from '@components/Header/HeaderRow'
<<<<<<< HEAD
import { MileageTrackingSummary } from '@components/MileageTrackingSummary/MileageTrackingSummary'
import { Onboarding } from '@components/Onboarding/Onboarding'
=======
>>>>>>> main
import { ProfitAndLoss } from '@components/ProfitAndLoss/ProfitAndLoss'
import {
  ProfitAndLossSummaries,
  type ProfitAndLossSummariesStringOverrides,
} from '@components/ProfitAndLossSummaries/ProfitAndLossSummaries'
import { ProfitAndLossSummaryCard } from '@components/ProfitAndLossSummaryCard/ProfitAndLossSummaryCard'
<<<<<<< HEAD
import { TaxEstimatesSummaryCard } from '@components/TaxEstimatesSummaryCard/TaxEstimatesSummaryCard'
import { View } from '@components/View/View'
import { type TagOption } from '@views/ProjectProfitability/ProjectProfitability'
=======
import {
  TaxEstimatesSummaryCard,
  TaxEstimatesSummaryCardMode,
} from '@components/TaxEstimatesSummaryCard/TaxEstimatesSummaryCard'
import { View } from '@components/View/View'
>>>>>>> main

import './solopreneurOverview.scss'

type CardStringOverrides = {
  header?: string
}

interface SolopreneurOverviewStringOverrides {
  title?: string
  profitAndLossSummaries?: ProfitAndLossSummariesStringOverrides
  profitAndLossSummaryCard?: CardStringOverrides
  expensesSummaryCard?: CardStringOverrides
  taxEstimatesSummaryCard?: CardStringOverrides
<<<<<<< HEAD
  mileageTrackingSummaryCard?: CardStringOverrides
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
        title={stringOverrides?.title || t('solopreneurOverview:label.solopreneur_overview', 'Overview')}
        showHeader={showTitle}
=======
}

export interface SolopreneurOverviewProps {
  onTransactionsToReviewClick?: () => void
  chartColorsList?: string[]
  stringOverrides?: SolopreneurOverviewStringOverrides
}

export const SolopreneurOverview = ({
  onTransactionsToReviewClick,
  chartColorsList,
  stringOverrides,
}: SolopreneurOverviewProps) => {
  const { t } = useTranslation()
  const { isMobile } = useSizeClass()

  return (
    <ProfitAndLoss asContainer={false}>
      <View
        title={stringOverrides?.title ?? t('solopreneurOverview:label.solopreneur_overview', 'Solopreneur overview')}
        showHeader
>>>>>>> main
        header={(
          <Header>
            <HeaderRow>
              <HeaderCol>
<<<<<<< HEAD
                <GlobalMonthPicker truncateMonth={sizeClass === 'mobile'} />
=======
                <GlobalMonthPicker truncateMonth={isMobile} />
>>>>>>> main
              </HeaderCol>
            </HeaderRow>
          </Header>
        )}
      >
<<<<<<< HEAD
        {enableOnboarding && (
          <Onboarding
            onTransactionsToReviewClick={onTransactionsToReviewClick}
            onboardingStepOverride={onboardingStepOverride}
          />
        )}
=======
>>>>>>> main
        <ProfitAndLossSummaries
          stringOverrides={stringOverrides?.profitAndLossSummaries}
          chartColorsList={chartColorsList}
          onTransactionsToReviewClick={onTransactionsToReviewClick}
<<<<<<< HEAD
          variants={profitAndLossSummariesVariants}
        />
        {middleBanner}
=======
        />
>>>>>>> main
        <div className='Layer__SolopreneurOverview__Grid'>
          <ProfitAndLossSummaryCard
            stringOverrides={{ title: stringOverrides?.profitAndLossSummaryCard?.header }}
          />
          <ExpensesSummaryCard
            stylingProps={{ chartColorsList }}
            stringOverrides={{ title: stringOverrides?.expensesSummaryCard?.header }}
          />
          <TaxEstimatesSummaryCard
<<<<<<< HEAD
            mode='horizontal_bar_chart'
            withHeaderSeparator
            title={stringOverrides?.taxEstimatesSummaryCard?.header}
          />
          <MileageTrackingSummary
            title={stringOverrides?.mileageTrackingSummaryCard?.header}
          />
=======
            mode={TaxEstimatesSummaryCardMode.HorizontalBarChart}
            withHeaderSeparator
            title={stringOverrides?.taxEstimatesSummaryCard?.header}
          />
>>>>>>> main
        </div>
      </View>
    </ProfitAndLoss>
  )
}
