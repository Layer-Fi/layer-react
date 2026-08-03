import { BaseSummariesBreakdownFooterContainer } from '@features/profitAndLoss/BaseSummariesBreakdownFooter/BaseSummariesBreakdownFooterContainer'
import { BaseSummariesBreakdownFooterRow, type BaseSummariesBreakdownRow } from '@features/profitAndLoss/BaseSummariesBreakdownFooter/BaseSummariesBreakdownFooterRow'
import { UncategorizedTransactionsBadge } from '@features/profitAndLoss/CashflowSummariesNetCashflowFooter/UncategorizedTransactionsBadge'

type CashflowSummariesNetCashflowFooterProps = {
  categorized?: BaseSummariesBreakdownRow
  isLoading?: boolean
  onTransactionsToReviewClick?: () => void
}

export function CashflowSummariesNetCashflowFooter({
  categorized,
  isLoading = false,
  onTransactionsToReviewClick,
}: CashflowSummariesNetCashflowFooterProps) {
  return (
    <BaseSummariesBreakdownFooterContainer>
      {categorized && <BaseSummariesBreakdownFooterRow row={categorized} isLoading={isLoading} />}
      {onTransactionsToReviewClick && (
        <UncategorizedTransactionsBadge onTransactionsToReviewClick={onTransactionsToReviewClick} />
      )}
    </BaseSummariesBreakdownFooterContainer>
  )
}
