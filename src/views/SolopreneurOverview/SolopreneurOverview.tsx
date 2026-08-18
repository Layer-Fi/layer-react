import { useTranslation } from 'react-i18next'

import { type ProfitAndLossChartConfig } from '@internal-types/features/profitAndLoss/profitAndLossChartConfig'
import { type CustomerManagedPlaidConfig } from '@schemas/features/linkedAccounts/customerManagedPlaidConfig'
import { type PlaidHostedLinkConfig } from '@schemas/features/linkedAccounts/plaidHostedLinkConfig'
import { useSizeClass } from '@hooks/utils/size/useWindowSize'
import { withUsageTracking } from '@components/utility/withUsageTracking'
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
  chartColorsList?: string[]
  stringOverrides?: SolopreneurOverviewStringOverrides
  interactionProps?: SolopreneurOverviewInteractionProps
  slotProps?: {
    profitAndLoss?: {
      summaries?: ProfitAndLossSummariesSlotProps
    }
    summaryCards?: {
      profitAndLoss?: { chartConfig?: ProfitAndLossChartConfig }
      expenses?: { chartConfig?: ProfitAndLossChartConfig }
    }
  }
  plaidHostedLinkConfig?: PlaidHostedLinkConfig
  customerManagedPlaidConfig?: CustomerManagedPlaidConfig
}

const SolopreneurOverviewComponent = ({
  interactionProps,
  chartColorsList,
  stringOverrides,
  slotProps,
  plaidHostedLinkConfig,
  customerManagedPlaidConfig,
}: SolopreneurOverviewProps) => {
  const { t } = useTranslation()
  const { value: sizeClass } = useSizeClass()

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
        <SolopreneurOnboardingBanner
          onSetupTaxProfile={interactionProps?.banner?.onSetupTaxProfile}
          plaidHostedLinkConfig={plaidHostedLinkConfig}
          customerManagedPlaidConfig={customerManagedPlaidConfig}
        />
        <ProfitAndLossSummaries
          stringOverrides={stringOverrides?.profitAndLossSummaries}
          chartConfig={slotProps?.profitAndLoss?.summaries?.chartConfig}
          chartColorsList={chartColorsList}
          reportingVariant={
            slotProps?.profitAndLoss?.summaries?.reportingVariant
            ?? SOLOPRENEUR_OVERVIEW_DEFAULT_REPORTING_VARIANT
          }
          variants={slotProps?.profitAndLoss?.summaries?.variants}
          onTransactionsToReviewClick={interactionProps?.cashflowSummaries?.onTransactionsToReviewClick}
        />
        <div className='Layer__SolopreneurOverview__Grid'>
          <ProfitAndLossSummaryCard
            chartConfig={slotProps?.summaryCards?.profitAndLoss?.chartConfig}
            stringOverrides={stringOverrides?.summaryCards?.profitAndLoss}
            interactionProps={interactionProps?.summaryCards?.profitAndLoss}
          />
          <ExpensesSummaryCard
            chartConfig={slotProps?.summaryCards?.expenses?.chartConfig}
            chartColorsList={chartColorsList}
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

export const SolopreneurOverview = withUsageTracking('SolopreneurOverview', SolopreneurOverviewComponent)
