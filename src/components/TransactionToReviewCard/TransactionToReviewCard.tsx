import React, {useContext, useEffect, useMemo, useState} from 'react'
import { Badge } from '../../components/Badge'
import { BadgeSize, BadgeVariant } from '../../components/Badge/Badge'
import { Text, TextSize } from '../../components/Typography'
import { useBankTransactionsContext } from '../../contexts/BankTransactionsContext'
import BellIcon from '../../icons/Bell'
import CheckIcon from '../../icons/Check'
import RefreshCcw from '../../icons/RefreshCcw'
import { countTransactionsToReview } from '../../utils/bankTransactions'
import { BadgeLoader } from '../BadgeLoader'
import { NotificationCard } from '../NotificationCard'
import {ProfitAndLoss} from "../ProfitAndLoss";

export interface TransactionToReviewCardProps {
  onClick?: () => void
  currentMonthOnly?: true
}

export const TransactionToReviewCard = ({
  onClick,
}: TransactionToReviewCardProps) => {
  const { dateRange } = useContext(ProfitAndLoss.Context)
  const {
    data,
    isLoading,
    loadingStatus,
    error,
    refetch,
    activate: activateBankTransactions,
  } = useBankTransactionsContext()

  useEffect(() => {
    activateBankTransactions()
  }, [])

  const toReview = useMemo(
    () => countTransactionsToReview({ transactions: data, dateRange }),
    [data, isLoading, dateRange],
  )

  return (
    <NotificationCard
      className='Layer__txs-to-review'
      onClick={() => onClick && onClick()}
    >
      <Text size={TextSize.sm}>Transactions to review</Text>
      {loadingStatus === 'initial' || loadingStatus === 'loading' ? (
        <BadgeLoader />
      ) : null}

      {loadingStatus === 'complete' && error ? (
        <Badge
          variant={BadgeVariant.ERROR}
          size={BadgeSize.SMALL}
          icon={<RefreshCcw size={12} />}
          onClick={() => refetch()}
        >
          Refresh
        </Badge>
      ) : null}

      {loadingStatus === 'complete' && !error && toReview > 0 ? (
        <Badge
          variant={BadgeVariant.WARNING}
          size={BadgeSize.SMALL}
          icon={<BellIcon size={12} />}
        >
          {toReview} pending
        </Badge>
      ) : null}

      {loadingStatus === 'complete' && !error && toReview === 0 ? (
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
