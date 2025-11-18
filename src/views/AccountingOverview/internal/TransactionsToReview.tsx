import { useContext, useEffect, useMemo } from 'react'
import { getMonth, getYear, startOfMonth } from 'date-fns'

import type { Variants } from '@utils/styleUtils/sizeVariants'
import { useProfitAndLossLTM } from '@hooks/useProfitAndLoss/useProfitAndLossLTM'
import { ProfitAndLossContext } from '@contexts/ProfitAndLossContext/ProfitAndLossContext'
import BellIcon from '@icons/Bell'
import CheckIcon from '@icons/Check'
import ChevronRight from '@icons/ChevronRight'
import RefreshCcw from '@icons/RefreshCcw'
import { type StackProps, VStack } from '@ui/Stack/Stack'
import { Badge } from '@components/Badge/Badge'
import { BadgeSize, BadgeVariant } from '@components/Badge/Badge'
import { BadgeLoader } from '@components/BadgeLoader/BadgeLoader'
import { IconButton } from '@components/Button/IconButton'
import { ProfitAndLossSummariesHeading } from '@components/ProfitAndLossSummaries/internal/ProfitAndLossSummariesHeading'

const CLASS_NAME = 'Layer__TransactionsToReview'

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

  const { dateRange: contextDateRange } = useContext(ProfitAndLossContext)
  const dateRange = usePnlDateRange ? contextDateRange : undefined

  const currentDate = useMemo(() => dateRange ? dateRange.startDate : startOfMonth(new Date()), [dateRange])

  const { data, isLoading, isError, refetch, setDate } = useProfitAndLossLTM({
    currentDate,
    tagFilter,
  })

  const activeMonth = useMemo(() => {
    if (!data || !dateRange) return undefined
    const { startDate } = dateRange

    return data.find(
      summary =>
        summary.month - 1 === getMonth(startDate)
        && summary.year === getYear(startDate),
    )
  }, [data, dateRange])

  // If we haven't loaded the current month's P&L summary data, go fetch it.
  useEffect(() => {
    if (!activeMonth) {
      setDate(currentDate)
    }
  }, [activeMonth, currentDate, setDate])

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
          onClick={() => refetch()}
        >
          Refresh
        </Badge>
      )
    }

    if (numTransactionsToReview > 0) {
      return (
        <Badge
          variant={BadgeVariant.WARNING}
          size={BadgeSize.SMALL}
          icon={<BellIcon size={12} />}
        >
          {numTransactionsToReview}
          {' '}
          pending
        </Badge>
      )
    }

    return (
      <Badge
        variant={BadgeVariant.SUCCESS}
        size={BadgeSize.SMALL}
        icon={<CheckIcon size={12} />}
      >
        All done
      </Badge>
    )
  }, [hasLoadedData, isError, numTransactionsToReview, refetch])

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
        <ProfitAndLossSummariesHeading variants={variants}>
          Transactions to review
        </ProfitAndLossSummariesHeading>
        {transactionsToReviewBadge}
      </VStack>
      <IconButton icon={<ChevronRight />} withBorder onClick={onClick} />
    </div>
  )
}
