import { type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

import { type OnboardingStep } from '@internal-types/layerContext'
import { type TagOption } from '@internal-types/tags'
import type { Variants } from '@utils/styleUtils/sizeVariants'
import { useSizeClass } from '@hooks/utils/size/useWindowSize'
import { Container } from '@components/Container/Container'
import { GlobalMonthPicker } from '@components/GlobalMonthPicker/GlobalMonthPicker'
import { Header } from '@components/Header/Header'
import { HeaderCol } from '@components/Header/HeaderCol'
import { HeaderRow } from '@components/Header/HeaderRow'
import { ProfitAndLoss } from '@components/ProfitAndLoss/ProfitAndLoss'
import { type ProfitAndLossDetailedChartsStringOverrides } from '@components/ProfitAndLossDetailedCharts/ProfitAndLossDetailedCharts'
import { ProfitAndLossHeader } from '@components/ProfitAndLossHeader/ProfitAndLossHeader'
import { ProfitAndLossOverviewDetailedCharts } from '@components/ProfitAndLossOverviewDetailedCharts/ProfitAndLossOverviewDetailedCharts'
import {
  ProfitAndLossSummaries,
  type ProfitAndLossSummariesStringOverrides,
} from '@components/ProfitAndLossSummaries/ProfitAndLossSummaries'
import { PnlLegend } from '@components/ProfitAndLossSummaryCard/PnlLegend'
import { View } from '@components/View/View'

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
  /** @deprecated The Project Profitability view has been removed. */
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
  const profitAndLossTagFilter = tagFilter?.tagValues.length
    ? { key: tagFilter.tagKey, values: tagFilter.tagValues }
    : undefined

  return (
    <ProfitAndLoss
      asContainer={false}
      tagFilter={profitAndLossTagFilter}
    >
      <View
        title={stringOverrides?.title || title || t('overview:label.accounting_overview', 'Accounting overview')}
        viewClassName='Layer__AccountingOverview'
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
        <ProfitAndLossSummaries
          stringOverrides={stringOverrides?.profitAndLoss?.summaries}
          chartColorsList={chartColorsList}
          onTransactionsToReviewClick={onTransactionsToReviewClick}
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
            trailingContent={<PnlLegend direction='row' />}
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
