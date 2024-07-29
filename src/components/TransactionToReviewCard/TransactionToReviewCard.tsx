import React, { useContext, useEffect, useMemo, useState } from 'react'
import { Badge } from '../../components/Badge'
import { BadgeSize, BadgeVariant } from '../../components/Badge/Badge'
import { Text, TextSize } from '../../components/Typography'
import { useProfitAndLossLTM } from '../../hooks/useProfitAndLoss/useProfitAndLossLTM'
import BellIcon from '../../icons/Bell'
import CheckIcon from '../../icons/Check'
import RefreshCcw from '../../icons/RefreshCcw'
import { countTransactionsToReview } from '../../utils/bankTransactions'
import { BadgeLoader } from '../BadgeLoader'
import { NotificationCard } from '../NotificationCard'
import { ProfitAndLoss } from '../ProfitAndLoss'
import { getMonth, getYear, startOfMonth } from 'date-fns'

export interface TransactionToReviewCardProps {
  onClick?: () => void
  usePnlDateRange?: boolean
}

export const TransactionToReviewCard = ({
  onClick,
  usePnlDateRange,
}: TransactionToReviewCardProps) => {
  const { dateRange: contextDateRange } = useContext(ProfitAndLoss.Context)
  const dateRange = usePnlDateRange ? contextDateRange : undefined

  const [toReview, setToReview] = useState(0)

  const { data, loaded, error, refetch, pullData } = useProfitAndLossLTM({
    currentDate: dateRange ? dateRange.startDate : startOfMonth(new Date()),
  })

  useEffect(() => {
    if (dateRange) {
      pullData(dateRange.startDate)
    }
  }, [dateRange])

  useMemo(() => {
    if (data && dateRange) {
      const monthTx = data.filter(
        x =>
          x.month === getMonth(dateRange.startDate) &&
          x.year === getYear(dateRange.startDate),
      )
      if (monthTx.length > 0) {
        setToReview(monthTx[0].uncategorized_transactions)
      }
    }
  }, [data])

  return (
    <NotificationCard
      className='Layer__txs-to-review'
      onClick={() => onClick && onClick()}
    >
      <Text size={TextSize.sm}>Transactions to review</Text>
      {loaded === 'initial' || loaded === 'loading' ? <BadgeLoader /> : null}

      {loaded === 'complete' && error ? (
        <Badge
          variant={BadgeVariant.ERROR}
          size={BadgeSize.SMALL}
          icon={<RefreshCcw size={12} />}
          onClick={() => refetch()}
        >
          Refresh
        </Badge>
      ) : null}

      {loaded === 'complete' && !error && toReview > 0 ? (
        <Badge
          variant={BadgeVariant.WARNING}
          size={BadgeSize.SMALL}
          icon={<BellIcon size={12} />}
        >
          {toReview} pending
        </Badge>
      ) : null}

      {loaded === 'complete' && !error && toReview === 0 ? (
        <Badge
          variant={BadgeVariant.SUCCESS}
          size={BadgeSize.SMALL}
          icon={<CheckIcon size={12} />}
        >
          All done
        </Badge>
      ) : null}
    </NotificationCard>
  )
}
