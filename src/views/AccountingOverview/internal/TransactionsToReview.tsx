import { useContext, useMemo } from 'react'
import { endOfMonth, getMonth, getYear, startOfMonth } from 'date-fns'

import type { Variants } from '@utils/styleUtils/sizeVariants'
import { useProfitAndLossSummaries } from '@hooks/useProfitAndLoss/useProfitAndLossSummaries'
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
  tagFilter?: {
    key: string
    values: string[]
  }
  variants?: Variants
}

export function TransactionsToReview({
  onClick,
  tagFilter = undefined,
  variants,
}: TransactionsToReviewProps) {
  const { size = 'sm' } = variants ?? {}

  const { dateRange } = useContext(ProfitAndLossContext)

  const monthStartDate = startOfMonth(dateRange.startDate)
  const monthEndDate = endOfMonth(dateRange.startDate)

  const { data, isLoading, isError, mutate } = useProfitAndLossSummaries({
    startYear: monthStartDate.getFullYear(),
    startMonth: monthStartDate.getMonth() + 1,
    endYear: monthEndDate.getFullYear(),
    endMonth: monthEndDate.getMonth() + 1,
    tagKey: tagFilter?.key,
    tagValues: tagFilter?.values?.join(','),
  })

  const activeMonth = useMemo(() => {
    if (!data) return undefined

    return data.months.find(
      summary =>
        summary.month - 1 === getMonth(monthStartDate)
        && summary.year === getYear(monthStartDate),
    )
  }, [data, monthStartDate])

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
  }, [hasLoadedData, isError, mutate, numTransactionsToReview])

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
