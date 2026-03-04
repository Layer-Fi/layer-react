import { useContext, useMemo } from 'react'

import type { Variants } from '@utils/styleUtils/sizeVariants'
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
  variants?: Variants
}

export function TransactionsToReview({
  onClick,
  variants,
}: TransactionsToReviewProps) {
  const { size = 'sm' } = variants ?? {}

  const { data: pnlData, isLoading, isError, refetch } = useContext(ProfitAndLossContext)

  const transactionCounts = pnlData?.transactionCounts
  const hasLoadedData = !isLoading && pnlData !== undefined
  const numTransactionsToReview =
    (transactionCounts?.uncategorizedInflows ?? 0)
    + (transactionCounts?.uncategorizedOutflows ?? 0)

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
  }, [hasLoadedData, isError, refetch, numTransactionsToReview])

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
