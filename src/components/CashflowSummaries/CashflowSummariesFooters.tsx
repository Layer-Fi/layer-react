import { DEFAULT_CHART_COLORS } from '@utils/chartColors'
import { CashflowSummariesNetCashflowFooter } from '@components/CashflowSummaries/CashflowSummariesNetCashflowFooter'
import { UNCATEGORIZED_CHART_COLOR } from '@components/ProfitAndLossDetailedCharts/utils'
import { BaseSummariesBreakdownFooter } from '@components/ProfitAndLossSummaries/internal/BaseSummariesBreakdownFooter'
import type { SummaryTileConfig } from '@components/ProfitAndLossSummaries/internal/SummariesContent'

type CashflowBreakdownFooterOptions = {
  showProfitAndLossBreakout: boolean
  chartColorsList?: string[]
  categorizedLabel: string
  uncategorizedLabel: string
}

export function getCashflowBreakdownFooter({
  showProfitAndLossBreakout,
  chartColorsList,
  categorizedLabel,
  uncategorizedLabel,
}: CashflowBreakdownFooterOptions): SummaryTileConfig['renderFooter'] {
  if (!showProfitAndLossBreakout) return undefined

  const categorizedSwatchColor = chartColorsList?.[0] ?? DEFAULT_CHART_COLORS[0]

  return ({ categorized, uncategorized }, isLoading) => (
    <BaseSummariesBreakdownFooter
      isLoading={isLoading}
      categorized={{
        label: categorizedLabel,
        amount: categorized,
        swatchColor: categorizedSwatchColor,
      }}
      uncategorized={{
        label: uncategorizedLabel,
        amount: uncategorized,
        swatchColor: UNCATEGORIZED_CHART_COLOR,
      }}
    />
  )
}

type CashflowNetCashflowFooterOptions = {
  showProfitAndLossBreakout: boolean
  categorizedLabel: string
  onTransactionsToReviewClick?: () => void
}

export function getCashflowNetCashflowFooter({
  showProfitAndLossBreakout,
  categorizedLabel,
  onTransactionsToReviewClick,
}: CashflowNetCashflowFooterOptions): SummaryTileConfig['renderFooter'] {
  if (!showProfitAndLossBreakout && !onTransactionsToReviewClick) return undefined

  return ({ categorized }, isLoading) => (
    <CashflowSummariesNetCashflowFooter
      isLoading={isLoading}
      categorized={showProfitAndLossBreakout
        ? {
          label: categorizedLabel,
          amount: categorized,
        }
        : undefined}
      onTransactionsToReviewClick={onTransactionsToReviewClick}
    />
  )
}
