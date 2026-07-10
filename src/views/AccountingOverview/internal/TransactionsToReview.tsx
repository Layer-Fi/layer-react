import { useMemo } from 'react'
import { getMonth, getYear } from 'date-fns'
import { Bell, Check, ChevronRight, RefreshCcw } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { useProfitAndLossSummaries } from '@hooks/api/businesses/[business-id]/reports/profit-and-loss-summaries/useProfitAndLossSummaries'
import { useGlobalDateRange } from '@providers/DateStoreProvider/GlobalDateStoreProvider'
import { Button } from '@ui/Button/Button'
import { VStack } from '@ui/Stack/Stack'
import { Span } from '@ui/Typography/Text'
import { Badge } from '@components/Badge/Badge'
import { BadgeSize, BadgeVariant } from '@components/Badge/Badge'
import { BadgeLoader } from '@components/BadgeLoader/BadgeLoader'

import './transactionsToReview.scss'

const CLASS_NAME = 'Layer__TransactionsToReview'

type TransactionsToReviewProps = {
  onClick?: () => void
  tagFilter?: {
    key: string
    values: string[]
  }
}

export function TransactionsToReview({
  onClick,
  tagFilter = undefined,
}: TransactionsToReviewProps) {
  const { t } = useTranslation()

  const dateRange = useGlobalDateRange({ dateSelectionMode: 'month' })

  const { data, isLoading, isError, mutate } = useProfitAndLossSummaries({
    startYear: dateRange.startDate.getFullYear(),
    startMonth: dateRange.startDate.getMonth() + 1,
    endYear: dateRange.endDate.getFullYear(),
    endMonth: dateRange.endDate.getMonth() + 1,
    tagKey: tagFilter?.key,
    tagValues: tagFilter?.values?.join(','),
  })

  const activeMonth = useMemo(() => {
    if (!data || !dateRange) return undefined
    const { startDate } = dateRange

    return data.months.find(
      summary =>
        summary.month - 1 === getMonth(startDate)
        && summary.year === getYear(startDate),
    )
  }, [data, dateRange])

  const hasLoadedData = !isLoading && activeMonth
  const numTransactionsToReview = activeMonth?.uncategorizedTransactions ?? 0

  const transactionsToReviewBadge = useMemo(() => {
    if (!hasLoadedData) {
      return <BadgeLoader />
    }

    if (isError) {
      return (
        <Badge
          variant={BadgeVariant.ERROR}
          size={BadgeSize.SMALL}
          icon={<RefreshCcw size={12} />}
          onClick={() => void mutate()}
        >
          {t('common:action.refresh_label', 'Refresh')}
        </Badge>
      )
    }

    if (numTransactionsToReview > 0) {
      return (
        <Badge
          variant={BadgeVariant.WARNING}
          size={BadgeSize.SMALL}
          icon={<Bell size={12} />}
        >
          {numTransactionsToReview}
          {' '}
          {t('bankTransactions:label.pending', 'pending')}
        </Badge>
      )
    }

    return (
      <Badge
        variant={BadgeVariant.SUCCESS}
        size={BadgeSize.SMALL}
        icon={<Check size={12} />}
      >
        {t('bankTransactions:label.all_done', 'All done')}
      </Badge>
    )
  }, [t, hasLoadedData, isError, mutate, numTransactionsToReview])

  return (
    <div className={CLASS_NAME}>
      <VStack gap='3xs' align='start'>
        <Span size='sm' weight='bold'>
          {t('bankTransactions:label.transactions_to_review', 'Transactions to review')}
        </Span>
        {transactionsToReviewBadge}
      </VStack>
      <Button
        variant='outlined'
        icon
        onPress={onClick}
        aria-label={t('bankTransactions:label.transactions_to_review', 'Transactions to review')}
      >
        <ChevronRight size={18} />
      </Button>
    </div>
  )
}
