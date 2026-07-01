import { useMemo } from 'react'
import { getMonth, getYear } from 'date-fns'
import { ArrowUpRight, Check, RefreshCcw } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { tPlural } from '@utils/i18n/plural'
import { useProfitAndLossSummaries } from '@hooks/api/businesses/[business-id]/reports/profit-and-loss-summaries/useProfitAndLossSummaries'
import { useIntlFormatter } from '@hooks/utils/i18n/useIntlFormatter'
import { useGlobalDateRange } from '@providers/DateStore/GlobalDateStore/GlobalDateStoreProvider'
import { Badge, BadgeSize, BadgeVariant } from '@components/Badge/Badge'
import { BadgeLoader } from '@components/BadgeLoader/BadgeLoader'

type UncategorizedTransactionsBadgeProps = {
  onTransactionsToReviewClick: () => void
}

export function UncategorizedTransactionsBadge({ onTransactionsToReviewClick }: UncategorizedTransactionsBadgeProps) {
  const { t } = useTranslation()
  const { formatNumber } = useIntlFormatter()
  const { startDate, endDate } = useGlobalDateRange({ dateSelectionMode: 'month' })

  const { data, isLoading, isError, mutate } = useProfitAndLossSummaries({
    startYear: startDate.getFullYear(),
    startMonth: startDate.getMonth() + 1,
    endYear: endDate.getFullYear(),
    endMonth: endDate.getMonth() + 1,
  })

  const activeMonth = useMemo(
    () => data?.months.find(
      summary => summary.month - 1 === getMonth(startDate) && summary.year === getYear(startDate),
    ),
    [data, startDate],
  )

  const uncategorizedCount = activeMonth?.uncategorizedTransactions ?? 0

  if (isLoading) {
    return <BadgeLoader />
  }

  if (isError) {
    return (
      <Badge
        variant={BadgeVariant.ERROR}
        size={BadgeSize.MEDIUM}
        icon={<RefreshCcw size={12} />}
        onClick={() => void mutate()}
      >
        {t('common:action.refresh_label', 'Refresh')}
      </Badge>
    )
  }

  if (!activeMonth) return null

  if (uncategorizedCount > 0) {
    return (
      <Badge
        onClick={onTransactionsToReviewClick}
        variant={BadgeVariant.WARNING}
        size={BadgeSize.MEDIUM}
        icon={<ArrowUpRight size={12} />}
        iconPosition='right'
      >
        {tPlural(t, 'bankTransactions:label.review_uncategorized_transactions', {
          count: uncategorizedCount,
          displayCount: formatNumber(uncategorizedCount),
          one: 'Review {{displayCount}} uncategorized transaction',
          other: 'Review {{displayCount}} uncategorized transactions',
        })}
      </Badge>
    )
  }

  return (
    <Badge variant={BadgeVariant.SUCCESS} size={BadgeSize.MEDIUM} icon={<Check size={12} />}>
      {t('bankTransactions:label.all_transactions_categorized', 'All transactions categorized')}
    </Badge>
  )
}
