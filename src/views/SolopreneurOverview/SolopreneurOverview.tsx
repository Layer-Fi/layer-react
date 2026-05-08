import { type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

import { type OnboardingStep } from '@internal-types/layerContext'
import type { Variants } from '@utils/styleUtils/sizeVariants'
import { useSizeClass, useWindowSize } from '@hooks/utils/size/useWindowSize'
import { Stack } from '@ui/Stack/Stack'
import { ExpensesSummaryCard } from '@components/ExpensesSummaryCard/ExpensesSummaryCard'
import { GlobalMonthPicker } from '@components/GlobalMonthPicker/GlobalMonthPicker'
import { Header } from '@components/Header/Header'
import { HeaderCol } from '@components/Header/HeaderCol'
import { HeaderRow } from '@components/Header/HeaderRow'
import { Onboarding } from '@components/Onboarding/Onboarding'
import { ProfitAndLoss } from '@components/ProfitAndLoss/ProfitAndLoss'
import { type ProfitAndLossDetailedChartsStringOverrides } from '@components/ProfitAndLossDetailedCharts/ProfitAndLossDetailedCharts'
import {
  ProfitAndLossSummaries,
  type ProfitAndLossSummariesStringOverrides,
} from '@components/ProfitAndLossSummaries/ProfitAndLossSummaries'
import { ProfitAndLossSummaryCard } from '@components/ProfitAndLossSummaryCard/ProfitAndLossSummaryCard'
import { SolopreneurOverviewDetailedCharts } from '@components/SolopreneurOverviewDetailedCharts/SolopreneurOverviewDetailedCharts'
import { View } from '@components/View/View'
import { type TagOption } from '@views/ProjectProfitability/ProjectProfitability'

import './solopreneurOverview.scss'

const SOLOPRENEUR_OVERVIEW_MOBILE_BREAKPOINT = 1200

interface SolopreneurOverviewStringOverrides {
  title?: string
  header?: string
  profitAndLoss?: {
    detailedCharts?: ProfitAndLossDetailedChartsStringOverrides
    summaries?: ProfitAndLossSummariesStringOverrides
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
  const [width] = useWindowSize()

  const profitAndLossSummariesVariants =
    slotProps?.profitAndLoss?.summaries?.variants

  const detailedChartsProps = {
    direction: width <= SOLOPRENEUR_OVERVIEW_MOBILE_BREAKPOINT ? 'column' as const : 'row' as const,
  }

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
        title={stringOverrides?.title || t('solopreneurOverview:label.solopreneur_overview', 'Solopreneur overview')}
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
        <Stack className='Layer__SolopreneurOverview__DetailedCharts' gap='md' {...detailedChartsProps}>
          <ProfitAndLossSummaryCard
            stringOverrides={{ title: stringOverrides?.header }}
          />
          {middleBanner}
          <ExpensesSummaryCard
            stylingProps={{ chartColorsList }}
          />
        </Stack>
        <SolopreneurOverviewDetailedCharts />
      </View>
    </ProfitAndLoss>
  )
}
