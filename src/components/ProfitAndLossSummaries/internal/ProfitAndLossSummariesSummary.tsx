import type { ReactNode } from 'react'

import type { Variants } from '@utils/styleUtils/sizeVariants'
import { SkeletonLoader } from '@components/SkeletonLoader/SkeletonLoader'
import { MoneySpan } from '@ui/Typography/MoneySpan'
import { ProfitAndLossSummariesHeading } from '@components/ProfitAndLossSummaries/internal/ProfitAndLossSummariesHeading'
import { formatPercentageChange } from '@utils/percentageChange'
import { HStack, VStack } from '@ui/Stack/Stack'
import { Span } from '@ui/Typography/Text'

const CHART_AREA_CLASS_NAME = 'Layer__ProfitAndLossSummariesSummaryChartArea'

type ProfitAndLossSummariesSummaryProps = {
  label: string
  amount: number
  isLoading?: boolean
  percentChange?: number | null
  comparisonMonth?: string
  isExpense?: boolean
  slots?: {
    Chart: ReactNode
  }
  variants?: Variants
}

export function ProfitAndLossSummariesSummary({
  label,
  amount,
  isLoading,
  percentChange,
  comparisonMonth,
  isExpense = false,
  slots,
  variants,
}: ProfitAndLossSummariesSummaryProps) {
  const { Chart } = slots ?? {}

  const showPercentChange = percentChange !== undefined && percentChange !== null && comparisonMonth

  const isGoodChange = showPercentChange && (isExpense ? percentChange < 0 : percentChange >= 0)
  const arrow = showPercentChange && percentChange >= 0 ? '↑' : '↓'

  return (
    <HStack gap='xs' align='center'>
      {Chart && (
        <HStack
          align='center'
          justify='center'
          className={CHART_AREA_CLASS_NAME}
        >
          {Chart}
        </HStack>
      )}

      <HStack gap='xs' fluid pi='sm'>
      <VStack gap='3xs' fluid>
        <ProfitAndLossSummariesHeading variants={variants}>
          {label}
        </ProfitAndLossSummariesHeading>
        {isLoading
          ? (
            <SkeletonLoader height='20px' />
          )
          : (
            <MoneySpan slot='amount' amount={amount} size='lg' bold />
          )}
      </VStack>

      <VStack gap='3xs' align='end' hidden={!showPercentChange}>
        <HStack gap='3xs' align='center'>
          <Span size='md' weight='bold' status={isGoodChange ? 'success' : undefined}>
            {arrow}
          </Span>
          <Span size='md' weight='normal' status={isGoodChange ? 'success' : undefined}>
            {formatPercentageChange(percentChange ?? null)}
          </Span>
        </HStack>
        <Span size='xs' variant='subtle' noWrap>
          vs. {comparisonMonth || ''}
        </Span>
      </VStack>
      </HStack>
    </HStack>
  )
}
