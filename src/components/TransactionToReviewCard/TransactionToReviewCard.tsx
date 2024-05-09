import React, { useEffect, useMemo, useState } from 'react'
import { Badge } from '../../components/Badge'
import { BadgeSize, BadgeVariant } from '../../components/Badge/Badge'
import { Text, TextSize } from '../../components/Typography'
import { useBankTransactions } from '../../hooks/useBankTransactions'
import BellIcon from '../../icons/Bell'
import CheckIcon from '../../icons/Check'
import RefreshCcw from '../../icons/RefreshCcw'
import { BadgeLoader } from '../BadgeLoader'
import {
  DisplayState,
  filterVisibility,
} from '../BankTransactions/BankTransactions'
import { NotificationCard } from '../NotificationCard'

export interface TransactionToReviewCardProps {
  onClick?: () => void
}

export const TransactionToReviewCard = ({
  onClick,
}: TransactionToReviewCardProps) => {
  const [loaded, setLoaded] = useState('initiated')
  const { data, isLoading, error, refetch } = useBankTransactions()

  useEffect(() => {
    if (!isLoading && data && data?.length > 0) {
      setLoaded('complete')
      return
    }
    if (isLoading && loaded === 'initiated') {
      setLoaded('loading')
      return
    }

    if (!isLoading && loaded !== 'initiated') {
      setLoaded('complete')
      return
    }
  }, [isLoading])

  const toReview = useMemo(() => {
    if (data && data.length > 0) {
      return data.filter(tx => filterVisibility(DisplayState.review, tx)).length
    }

    return 0
  }, [data, isLoading])

  return (
    <NotificationCard
      className='Layer__txs-to-review'
      onClick={() => onClick && onClick()}
    >
      <Text size={TextSize.sm}>Transactions to review</Text>
      {loaded === 'initiated' || loaded === 'loading' ? <BadgeLoader /> : null}

      {loaded === 'complete' && error ? (
        <Badge
          variant={BadgeVariant.ERROR}
          size={BadgeSize.SMALL}
          icon={<RefreshCcw size={12} />}
          onClick={() => {
            setLoaded('loading')
            refetch()
          }}
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
