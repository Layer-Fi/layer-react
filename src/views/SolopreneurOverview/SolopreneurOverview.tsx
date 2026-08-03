import { useTranslation } from 'react-i18next'

import { type PlaidHostedLinkConfig } from '@schemas/linkedAccounts/plaid'
import { useSizeClass } from '@hooks/utils/size/useWindowSize'
import { Header } from '@ui/Header/Header'
import { HeaderCol } from '@ui/Header/HeaderCol'
import { HeaderRow } from '@ui/Header/HeaderRow'
import { GlobalMonthPicker } from '@blocks/DatePickers/GlobalMonthPicker/GlobalMonthPicker'
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
          stringOverrides={stringOverrides?.profitAndLossSummaries}
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
