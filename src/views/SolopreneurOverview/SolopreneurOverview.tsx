import { useTranslation } from 'react-i18next'

import { type PlaidHostedLinkConfig } from '@schemas/linkedAccounts/plaid'
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
  type FinancialSummariesSlotProps,
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
  cashflowSummaries?: ProfitAndLossSummariesStringOverrides
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
    financialSummaries?: FinancialSummariesSlotProps
  }
  plaidHostedLinkConfig?: PlaidHostedLinkConfig
}

export const SolopreneurOverview = ({
  interactionProps,
  chartColorsList,
  stringOverrides,
  slotProps,
  plaidHostedLinkConfig,
}: SolopreneurOverviewProps) => {
  const { t } = useTranslation()
  const { value: sizeClass } = useSizeClass()
  const financialSummariesSlotProps = slotProps?.financialSummaries

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
        />
        <ProfitAndLossSummaries
          stringOverrides={stringOverrides?.cashflowSummaries}
          chartColorsList={chartColorsList}
          reportingVariant={financialSummariesSlotProps?.reportingVariant ?? { type: 'cashflow' }}
          variants={financialSummariesSlotProps?.variants}
          onTransactionsToReviewClick={interactionProps?.cashflowSummaries?.onTransactionsToReviewClick}
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
