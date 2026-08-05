import { type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

import { type TagOption } from '@internal-types/features/tags/tag'
import { type OnboardingStep } from '@internal-types/shared/layerContext'
import { useSizeClass } from '@hooks/utils/size/useWindowSize'
import { GlobalMonthPicker } from '@blocks/DatePickers/GlobalMonthPicker/GlobalMonthPicker'
import { Container } from '@blocks/Layout/Container/Container'
import { View } from '@blocks/Layout/View/View'
import { ProfitAndLoss } from '@features/profitAndLoss/ProfitAndLoss/ProfitAndLoss'
import { type ProfitAndLossDetailedChartsStringOverrides } from '@features/profitAndLoss/ProfitAndLossDetailedCharts/ProfitAndLossDetailedCharts'
import { ProfitAndLossHeader } from '@features/profitAndLoss/ProfitAndLossHeader/ProfitAndLossHeader'
import { ProfitAndLossLegend } from '@features/profitAndLoss/ProfitAndLossLegend/ProfitAndLossLegend'
import { ProfitAndLossOverviewDetailedCharts } from '@features/profitAndLoss/ProfitAndLossOverviewDetailedCharts/ProfitAndLossOverviewDetailedCharts'
import {
  ProfitAndLossSummaries,
  type ProfitAndLossSummariesSlotProps,
  type ProfitAndLossSummariesStringOverrides,
} from '@features/profitAndLoss/ProfitAndLossSummaries/ProfitAndLossSummaries'

import './accountingOverview.scss'

interface AccountingOverviewStringOverrides {
  title?: string
  header?: string
  profitAndLoss?: {
    detailedCharts?: ProfitAndLossDetailedChartsStringOverrides
    summaries?: ProfitAndLossSummariesStringOverrides
  }
}

export interface AccountingOverviewProps {
  /** @deprecated Use `stringOverrides.title` instead */
  title?: string
  showTitle?: boolean
  /** @deprecated The Onboarding component has been removed; this prop no longer does anything. */
  enableOnboarding?: boolean
  /** @deprecated The Onboarding component has been removed; this prop no longer does anything. */
  onboardingStepOverride?: OnboardingStep
  onTransactionsToReviewClick?: () => void
  middleBanner?: ReactNode
  chartColorsList?: string[]
  stringOverrides?: AccountingOverviewStringOverrides
  tagFilter?: TagOption
  slotProps?: {
    profitAndLoss?: {
      summaries?: ProfitAndLossSummariesSlotProps
    }
  }
}

export const AccountingOverview = ({
  title,
  showTitle = true,
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
  const profitAndLossSummariesReportingVariant =
    slotProps?.profitAndLoss?.summaries?.reportingVariant
  const profitAndLossTagFilter = tagFilter?.tagValues.length
    ? { key: tagFilter.tagKey, values: tagFilter.tagValues }
    : undefined

  return (
    <ProfitAndLoss
      asContainer={false}
      tagFilter={profitAndLossTagFilter}
    >
      <View
        title={stringOverrides?.title || title || t('views:AccountingOverview.label.accounting_overview', 'Accounting overview')}
        className='Layer__AccountingOverview'
        showHeader={showTitle}
        header={<GlobalMonthPicker truncateMonth={sizeClass === 'mobile'} />}
      >
        <ProfitAndLossSummaries
          stringOverrides={stringOverrides?.profitAndLoss?.summaries}
          chartColorsList={chartColorsList}
          onTransactionsToReviewClick={onTransactionsToReviewClick}
          reportingVariant={profitAndLossSummariesReportingVariant}
          variants={profitAndLossSummariesVariants}
        />
        <Container
          name='accounting-overview-profit-and-loss'
          className='Layer__AccountingOverview__ProfitAndLossContainer'
          asWidget
        >
          <ProfitAndLossHeader
            stringOverrides={{ title: stringOverrides?.header }}
            className='Layer__AccountingOverview__ProfitAndLossHeader'
            trailingContent={<ProfitAndLossLegend direction='row' />}
          />
          <ProfitAndLoss.Chart
            tagFilter={profitAndLossTagFilter}
            hideLegend
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
