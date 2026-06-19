import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { DEFAULT_CHART_COLORS } from '@utils/chartColors'
import type { Variants } from '@utils/styleUtils/sizeVariants'
import { CashflowSummariesNetCashflowFooter } from '@components/CashflowSummaries/CashflowSummariesNetCashflowFooter'
import { UNCATEGORIZED_CHART_COLOR } from '@components/ProfitAndLossDetailedCharts/utils'
import { BaseSummariesBreakdownFooter } from '@components/ProfitAndLossSummaries/internal/BaseSummariesBreakdownFooter'
import {
  SummariesContent,
  type SummariesTiles,
} from '@components/ProfitAndLossSummaries/internal/SummariesContent'

export interface CashflowSummariesStringOverrides {
  moneyInLabel?: string
  moneyOutLabel?: string
  netCashFlowLabel?: string
}

type CashflowSummariesProps = {
  stringOverrides?: CashflowSummariesStringOverrides
  chartColorsList?: string[]
  variants?: Variants
  onTransactionsToReviewClick?: () => void
}

export function CashflowSummaries({
  stringOverrides,
  chartColorsList,
  variants,
  onTransactionsToReviewClick,
}: CashflowSummariesProps) {
  const { t } = useTranslation()

  const uncategorizedLabel = t('common:label.uncategorized', 'Uncategorized')
  const categorizedSwatchColor = chartColorsList?.[0] ?? DEFAULT_CHART_COLORS[0]

  const tiles: SummariesTiles = useMemo(() => ({
    revenue: {
      label: stringOverrides?.moneyInLabel || t('common:label.money_in', 'Money in'),
      renderFooter: ({ categorized, uncategorized }, isLoading) => (
        <BaseSummariesBreakdownFooter
          isLoading={isLoading}
          categorized={{
            label: t('overview:label.categorized_revenue', 'Categorized revenue'),
            amount: categorized,
            swatchColor: categorizedSwatchColor,
          }}
          uncategorized={{
            label: uncategorizedLabel,
            amount: uncategorized,
            swatchColor: UNCATEGORIZED_CHART_COLOR,
          }}
        />
      ),
    },
    expenses: {
      label: stringOverrides?.moneyOutLabel || t('common:label.money_out', 'Money out'),
      renderFooter: ({ categorized, uncategorized }, isLoading) => (
        <BaseSummariesBreakdownFooter
          isLoading={isLoading}
          categorized={{
            label: t('overview:label.categorized_expenses', 'Categorized expenses'),
            amount: categorized,
            swatchColor: categorizedSwatchColor,
          }}
          uncategorized={{
            label: uncategorizedLabel,
            amount: uncategorized,
            swatchColor: UNCATEGORIZED_CHART_COLOR,
          }}
        />
      ),
    },
    net: {
      label: stringOverrides?.netCashFlowLabel || t('overview:label.net_cash_flow', 'Net cash flow'),
      renderFooter: ({ categorized }, isLoading) => (
        <CashflowSummariesNetCashflowFooter
          isLoading={isLoading}
          categorized={{
            label: t('overview:label.categorized_net_profit', 'Categorized net profit'),
            amount: categorized,
          }}
          onTransactionsToReviewClick={onTransactionsToReviewClick}
        />
      ),
    },
  }), [
    stringOverrides?.moneyInLabel,
    stringOverrides?.moneyOutLabel,
    stringOverrides?.netCashFlowLabel,
    t,
    uncategorizedLabel,
    categorizedSwatchColor,
    onTransactionsToReviewClick,
  ])

  return <SummariesContent mode='cashflow' tiles={tiles} variants={variants} chartColorsList={chartColorsList} />
}
