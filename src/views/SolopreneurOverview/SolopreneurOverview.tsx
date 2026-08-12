import { useTranslation } from 'react-i18next'

import { type ProfitAndLossChartConfig } from '@internal-types/features/profitAndLoss/profitAndLossChartConfig'
import { type PlaidHostedLinkConfig } from '@schemas/features/linkedAccounts/plaidHostedLinkConfig'
import { useSizeClass } from '@hooks/utils/size/useWindowSize'
import { GlobalMonthPicker } from '@blocks/DatePickers/GlobalMonthPicker/GlobalMonthPicker'
import { Header } from '@blocks/Layout/Header/Header'
import { HeaderCol } from '@blocks/Layout/Header/HeaderCol'
import { HeaderRow } from '@blocks/Layout/Header/HeaderRow'
import { View } from '@blocks/Layout/View/View'
import { type SummaryCardInteractionProps, type SummaryCardStringOverrides } from '@blocks/SummaryCard/useSummaryCardSlots'
import { MileageTrackingSummary } from '@features/mileage/MileageTrackingSummary/MileageTrackingSummary'
import { ExpensesSummaryCard } from '@features/profitAndLoss/ExpensesSummaryCard/ExpensesSummaryCard'
import { ProfitAndLoss } from '@features/profitAndLoss/ProfitAndLoss/ProfitAndLoss'
import {
  ProfitAndLossSummaries,
  type ProfitAndLossSummariesReportingVariant,
  type ProfitAndLossSummariesSlotProps,
  type ProfitAndLossSummariesStringOverrides,
} from '@features/profitAndLoss/ProfitAndLossSummaries/ProfitAndLossSummaries'
import { ProfitAndLossSummaryCard } from '@features/profitAndLoss/ProfitAndLossSummaryCard/ProfitAndLossSummaryCard'
import {
  TaxEstimatesSummaryCard,
  TaxEstimatesSummaryCardMode,
} from '@features/taxEstimates/TaxEstimatesSummaryCard/TaxEstimatesSummaryCard'
import { SolopreneurOnboardingBanner } from '@views/SolopreneurOverview/SolopreneurOnboardingBanner/SolopreneurOnboardingBanner'

import './solopreneurOverview.scss'

const SOLOPRENEUR_OVERVIEW_DEFAULT_REPORTING_VARIANT = {
  type: 'cashflow',
} satisfies ProfitAndLossSummariesReportingVariant

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
  banner?: {
    onSetupTaxProfile?: () => void
  }
  cashflowSummaries?: {
    onTransactionsToReviewClick?: () => void
  }
  summaryCards?: {
    profitAndLoss?: SummaryCardInteractionProps
    expenses?: SummaryCardInteractionProps
    taxEstimates?: SummaryCardInteractionProps
    mileageTracking?: SummaryCardInteractionProps
  }
}

export interface SolopreneurOverviewProps {
  /** Colors and sizing for every P&L chart in this view. */
  chartConfig?: ProfitAndLossChartConfig
  /**
   * Flat palette applied to both scopes. Fully supported; it is the fallback for whichever side
   * of `chartConfig.colors` is omitted.
   */
  chartColorsList?: string[]
  stringOverrides?: SolopreneurOverviewStringOverrides
  interactionProps?: SolopreneurOverviewInteractionProps
  slotProps?: {
    profitAndLoss?: {
      summaries?: ProfitAndLossSummariesSlotProps
    }
  }
  plaidHostedLinkConfig?: PlaidHostedLinkConfig
}

export const SolopreneurOverview = ({
  interactionProps,
  chartConfig,
  chartColorsList,
  stringOverrides,
  slotProps,
  plaidHostedLinkConfig,
}: SolopreneurOverviewProps) => {
  const { t } = useTranslation()
  const { value: sizeClass } = useSizeClass()

  return (

    <ProfitAndLoss asContainer={false} chartConfig={chartConfig} chartColorsList={chartColorsList}>
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
        <SolopreneurOnboardingBanner
          onSetupTaxProfile={interactionProps?.banner?.onSetupTaxProfile}
          plaidHostedLinkConfig={plaidHostedLinkConfig}
        />
        <ProfitAndLossSummaries
          stringOverrides={stringOverrides?.profitAndLossSummaries}
          reportingVariant={
            slotProps?.profitAndLoss?.summaries?.reportingVariant
            ?? SOLOPRENEUR_OVERVIEW_DEFAULT_REPORTING_VARIANT
          }
          variants={slotProps?.profitAndLoss?.summaries?.variants}
          onTransactionsToReviewClick={interactionProps?.cashflowSummaries?.onTransactionsToReviewClick}
        />
        <div className='Layer__SolopreneurOverview__Grid'>
          <ProfitAndLossSummaryCard
            stringOverrides={stringOverrides?.summaryCards?.profitAndLoss}
            interactionProps={interactionProps?.summaryCards?.profitAndLoss}
          />
          <ExpensesSummaryCard
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
