import React, { useContext, useEffect, useMemo, useState } from 'react'
import { Badge } from '../../../components/Badge'
import { BadgeSize, BadgeVariant } from '../../../components/Badge/Badge'
import { BadgeLoader } from '../../../components/BadgeLoader'
import { IconButton } from '../../../components/Button'
import { ProfitAndLoss } from '../../../components/ProfitAndLoss'
import { Text, TextSize } from '../../../components/Typography'
import { StackProps, VStack } from '../../../components/ui/Stack'
import { useProfitAndLossLTM } from '../../../hooks/useProfitAndLoss/useProfitAndLossLTM'
import BellIcon from '../../../icons/Bell'
import CheckIcon from '../../../icons/Check'
import ChevronRight from '../../../icons/ChevronRight'
import RefreshCcw from '../../../icons/RefreshCcw'
import type { Variants } from '../../../utils/styleUtils/sizeVariants'
import { toDataProperties } from '../../../utils/styleUtils/toDataProperties'
import { getMonth, getYear, startOfMonth } from 'date-fns'

const CLASS_NAME = 'Layer__TransactionsToReview'
const HEADING_CLASS_NAME = 'Layer__ProfitAndLossSummariesSummaryHeading'

type TransactionsToReviewProps = {
  onClick?: () => void
  usePnlDateRange?: boolean
  tagFilter?: {
    key: string
    values: string[]
  }
  variants?: Variants
}

export function TransactionsToReview({
  onClick,
  usePnlDateRange,
  tagFilter = undefined,
  variants,
}: TransactionsToReviewProps) {
  const { size = 'sm' } = variants ?? {}

  const { dateRange: contextDateRange } = useContext(ProfitAndLoss.Context)
  const dateRange = usePnlDateRange ? contextDateRange : undefined

  const [toReview, setToReview] = useState(0)

  const { data, loaded, error, refetch } = useProfitAndLossLTM({
    currentDate: dateRange ? dateRange.startDate : startOfMonth(new Date()),
    tagFilter,
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

  const labelDataProperties = useMemo(() => toDataProperties({ size }), [size])
  let verticalGap: StackProps['gap'] = '3xs'
  switch (size) {
    case 'sm':
      verticalGap = '3xs'
      break
    case 'lg':
      verticalGap = 'sm'
      break
  }
  return (
    <div onClick={onClick} className={CLASS_NAME}>
      <VStack gap={verticalGap} align='start'>
        <h3 className={HEADING_CLASS_NAME} {...labelDataProperties}>
          Transactions to review
        </h3>
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
      </VStack>
      <IconButton icon={<ChevronRight />} withBorder onClick={onClick} />
    </div>
  )
}
