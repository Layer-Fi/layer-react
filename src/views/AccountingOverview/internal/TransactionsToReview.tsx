import { useContext, useMemo } from 'react'
import { Badge } from '../../../components/Badge'
import { BadgeSize, BadgeVariant } from '../../../components/Badge/Badge'
import { BadgeLoader } from '../../../components/BadgeLoader'
import { IconButton } from '../../../components/Button'
import { ProfitAndLoss } from '../../../components/ProfitAndLoss'
import { ProfitAndLossSummariesHeading } from '../../../components/ProfitAndLossSummaries/internal/ProfitAndLossSummariesHeading'
import { StackProps, VStack } from '../../../components/ui/Stack/Stack'
import { useProfitAndLossLTM } from '../../../hooks/useProfitAndLoss/useProfitAndLossLTM'
import BellIcon from '../../../icons/Bell'
import CheckIcon from '../../../icons/Check'
import ChevronRight from '../../../icons/ChevronRight'
import RefreshCcw from '../../../icons/RefreshCcw'
import type { Variants } from '../../../utils/styleUtils/sizeVariants'
import { getMonth, getYear, startOfMonth } from 'date-fns'

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

  const { dateRange: contextDateRange } = useContext(ProfitAndLoss.Context)
  const dateRange = usePnlDateRange ? contextDateRange : undefined

  const { data, isLoading, isError, refetch } = useProfitAndLossLTM({
    currentDate: dateRange ? dateRange.startDate : startOfMonth(new Date()),
    tagFilter,
  })

  const numTransactionsToReview = useMemo(() => {
    if (!data || !dateRange) return 0
    const { startDate } = dateRange

    const activeMonth = data.find(
      summary =>
        summary.month - 1 === getMonth(startDate)
        && summary.year === getYear(startDate),
    )

    if (!activeMonth) return 0

    return activeMonth.uncategorizedTransactions
  }, [data, dateRange])

  const hasLoadedData = !isLoading && data
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
