import React, { useContext, useEffect, useState } from 'react'
import { Text, TextSize } from '../../components/Typography'
import { useProfitAndLossLTM } from '../../hooks/useProfitAndLoss/useProfitAndLossLTM'
import { NotificationCard } from '../NotificationCard'
import { ProfitAndLoss } from '../ProfitAndLoss'
import { Badges } from './Badges'
import classNames from 'classnames'
import { getMonth, getYear, startOfMonth } from 'date-fns'

export interface TransactionToReviewCardProps {
  onClick?: () => void
  usePnlDateRange?: boolean
  hideWhenNoTransactions?: boolean
  size?: 'large' | 'medium'
}

export const TransactionToReviewCard = ({
  onClick,
  usePnlDateRange,
  size = 'medium',
  hideWhenNoTransactions = false,
}: TransactionToReviewCardProps) => {
  const { dateRange: contextDateRange } = useContext(ProfitAndLoss.Context)
  const dateRange = usePnlDateRange ? contextDateRange : undefined

  const [toReview, setToReview] = useState(0)

  const { data, loaded, error, refetch } = useProfitAndLossLTM({
    currentDate: dateRange ? dateRange.startDate : startOfMonth(new Date()),
  })

  useEffect(() => {
    checkTransactionsToReview()
  }, [])

  useEffect(() => {
    checkTransactionsToReview()
  }, [dateRange, loaded])

  const checkTransactionsToReview = () => {
    if (data && dateRange) {
      const monthTx = data.filter(
        x =>
          x.month - 1 === getMonth(dateRange.startDate) &&
          x.year === getYear(dateRange.startDate),
      )
      if (monthTx.length > 0) {
        setToReview(monthTx[0].uncategorized_transactions)
      }
    }
  }

  if (toReview === 0 && hideWhenNoTransactions) {
    return null
  }

  return (
    <NotificationCard
      className={classNames(
        'Layer__txs-to-review',
        `Layer__txs-to-review--${size}`,
      )}
      onClick={() => onClick && onClick()}
      bottomBar={
        size === 'large' && (
          <Badges
            loaded={loaded}
            error={error}
            refetch={refetch}
            toReview={toReview}
            inBottomBar
          />
        )
      }
    >
      <Text size={TextSize.sm}>Transactions to review</Text>
      {size !== 'large' && (
        <Badges
          loaded={loaded}
          error={error}
          refetch={refetch}
          toReview={toReview}
        />
      )}
    </NotificationCard>
  )
}
