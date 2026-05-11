import { useTranslation } from 'react-i18next'

import type { Variants } from '@utils/styleUtils/sizeVariants'
import { useSizeClass } from '@hooks/utils/size/useWindowSize'
import { type SummaryCardInteractionProps, type SummaryCardStringOverrides } from '@ui/SummaryCard/useSummaryCardSlots'
import { ExpensesSummaryCard } from '@components/ExpensesSummaryCard/ExpensesSummaryCard'
import { GlobalMonthPicker } from '@components/GlobalMonthPicker/GlobalMonthPicker'
import { Header } from '@components/Header/Header'
import { HeaderCol } from '@components/Header/HeaderCol'
import { HeaderRow } from '@components/Header/HeaderRow'
import { MileageTrackingSummary } from '@components/MileageTrackingSummary/MileageTrackingSummary'
import { ProfitAndLoss } from '@components/ProfitAndLoss/ProfitAndLoss'
import {
  ProfitAndLossSummaries,
  type ProfitAndLossSummariesStringOverrides,
} from '@components/ProfitAndLossSummaries/ProfitAndLossSummaries'
import { ProfitAndLossSummaryCard } from '@components/ProfitAndLossSummaryCard/ProfitAndLossSummaryCard'
import { SolopreneurOnboardingBanner } from '@components/SolopreneurOnboardingBanner/SolopreneurOnboardingBanner'
import {
  TaxEstimatesSummaryCard,
  TaxEstimatesSummaryCardMode,
} from '@components/TaxEstimatesSummaryCard/TaxEstimatesSummaryCard'
import { View } from '@components/View/View'

import './solopreneurOverview.scss'

interface SolopreneurOverviewStringOverrides {
  title?: string
  profitAndLossSummaries?: ProfitAndLossSummariesStringOverrides
  summaryCards?: {
    profitAndLoss?: SummaryCardStringOverrides
    expenses?: SummaryCardStringOverrides
    taxEstimates?: SummaryCardStringOverrides
    mileageTracking?: SummaryCardStringOverrides
  }
}

interface SolopreneurOverviewInteractionProps {
  common?: {
    onTransactionsToReviewClick?: () => void
  }
  banner: {
    onSetupTaxProfile: () => void
  }
  summaryCards?: {
    profitAndLoss?: SummaryCardInteractionProps
    expenses?: SummaryCardInteractionProps
    taxEstimates?: SummaryCardInteractionProps
    mileageTracking?: SummaryCardInteractionProps
  }
}

export interface SolopreneurOverviewProps {
  chartColorsList?: string[]
  stringOverrides?: SolopreneurOverviewStringOverrides
  interactionProps: SolopreneurOverviewInteractionProps
  slotProps?: {
    profitAndLoss?: {
      summaries?: {
        variants?: Variants
      }
    }
  }
}

export const SolopreneurOverview = ({
  interactionProps,
  chartColorsList,
  stringOverrides,
  slotProps,
}: SolopreneurOverviewProps) => {
  const { t } = useTranslation()
  const { value: sizeClass } = useSizeClass()

  const profitAndLossSummariesVariants =
    slotProps?.profitAndLoss?.summaries?.variants

  return (
    <ProfitAndLoss asContainer={false}>
      <View
        title={stringOverrides?.title || t('common:label.overview', 'Overview')}
        showHeader
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
        <SolopreneurOnboardingBanner onSetupTaxProfile={interactionProps.banner.onSetupTaxProfile} />
        <ProfitAndLossSummaries
          stringOverrides={stringOverrides?.profitAndLossSummaries}
          chartColorsList={chartColorsList}
          onTransactionsToReviewClick={interactionProps?.common?.onTransactionsToReviewClick}
          variants={profitAndLossSummariesVariants}
        />
        <div className='Layer__SolopreneurOverview__Grid'>
          <ProfitAndLossSummaryCard
            stringOverrides={stringOverrides?.summaryCards?.profitAndLoss}
            interactionProps={interactionProps?.summaryCards?.profitAndLoss}
          />
          <ExpensesSummaryCard
            stylingProps={{ chartColorsList }}
            stringOverrides={stringOverrides?.summaryCards?.expenses}
            interactionProps={interactionProps?.summaryCards?.expenses}
          />
          <TaxEstimatesSummaryCard
            mode={TaxEstimatesSummaryCardMode.HorizontalBarChart}
            stringOverrides={stringOverrides?.summaryCards?.taxEstimates}
            interactionProps={interactionProps?.summaryCards?.taxEstimates}
          />
          <MileageTrackingSummary
            interactionProps={interactionProps?.summaryCards?.mileageTracking}
            stringOverrides={stringOverrides?.summaryCards?.mileageTracking}
          />
        </div>
      </View>
    </ProfitAndLoss>
  )
}
