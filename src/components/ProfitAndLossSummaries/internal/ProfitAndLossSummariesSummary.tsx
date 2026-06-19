import classNames from 'classnames'
import type { ReactNode } from 'react'
import { Trans } from 'react-i18next'

import type { Variants } from '@utils/styleUtils/sizeVariants'
import { useIntlFormatter } from '@hooks/utils/i18n/useIntlFormatter'
import { HStack, VStack } from '@ui/Stack/Stack'
import { MoneySpan } from '@ui/Typography/MoneySpan'
import { Span } from '@ui/Typography/Text'
import { ProfitAndLossSummariesHeading } from '@components/ProfitAndLossSummaries/internal/ProfitAndLossSummariesHeading'
import { type ProfitAndLossSummariesMode } from '@components/ProfitAndLossSummaries/useProfitAndLossSummariesMiniChartData'
import { SkeletonLoader } from '@components/SkeletonLoader/SkeletonLoader'

import './profitAndLossSummariesSummary.scss'

const BASE_CLASS_NAME = 'Layer__ProfitAndLossSummariesSummary'
const CHART_AREA_CLASS_NAME = 'Layer__ProfitAndLossSummariesSummary__ChartArea'

type ProfitAndLossSummariesSummaryProps = {
  label: string
  amount: number
  isLoading?: boolean
  isComparisonLoading?: boolean
  percentChange?: number | null
  comparisonMonth?: string
  isExpense?: boolean
  mode: ProfitAndLossSummariesMode
  slots?: {
    Chart?: ReactNode
    Footer?: ReactNode
  }
  variants?: Variants
}

export function ProfitAndLossSummariesSummary({
  label,
  amount,
  isLoading,
  isComparisonLoading,
  percentChange,
  comparisonMonth,
  isExpense = false,
  mode,
  slots,
  variants,
}: ProfitAndLossSummariesSummaryProps) {
  const { formatPercent } = useIntlFormatter()
  const { Chart, Footer } = slots ?? {}

  const showPercentChange = percentChange !== undefined && percentChange !== null && comparisonMonth

  const isGoodChange = showPercentChange && (isExpense ? percentChange < 0 : percentChange >= 0)
  const arrow = showPercentChange && percentChange >= 0 ? '↑' : '↓'

  const maxPercentageChangedDigits = percentChange
    ? Math.abs(percentChange) < 0.1 && percentChange !== 0 ? 1 : 0
    : 0

  return (
    <div className={classNames(BASE_CLASS_NAME, mode === 'cashflow' && `${BASE_CLASS_NAME}--cashflow`)}>
      <HStack align='center' overflow='hidden' className='Layer__ProfitAndLossSummariesSummary__Summary'>
        {Chart && (
          <HStack
            align='center'
            justify='center'
            className={CHART_AREA_CLASS_NAME}
          >
            {Chart}
          </HStack>
        )}

        <HStack justify='space-between' fluid pis='sm' pie='xs'>
          <VStack fluid>
            <ProfitAndLossSummariesHeading variants={variants}>
              {label}
            </ProfitAndLossSummariesHeading>
            {isLoading
              ? <SkeletonLoader height='22px' />
              : <MoneySpan slot='amount' amount={amount} size='lg' weight='bold' numeric='tabular-nums' />}
          </VStack>

          {showPercentChange && !isComparisonLoading && (
            <VStack align='end'>
              <HStack gap='3xs' align='center'>
                <Span size='md' weight='bold' status={isGoodChange ? 'success' : undefined}>
                  {arrow}
                </Span>
                <Span size='md' weight='normal' status={isGoodChange ? 'success' : undefined}>
                  {formatPercent(
                    Math.abs(percentChange ?? 0),
                    { maximumFractionDigits: maxPercentageChangedDigits },
                  )}
                </Span>
              </HStack>
              <Span size='xs' variant='subtle' noWrap>
                <Trans
                  i18nKey='overview:label.vs_comparison_month'
                  values={{ comparisonMonth: comparisonMonth ?? '' }}
                >
                  vs.
                  {' '}
                  {{ comparisonMonth }}
                </Trans>
              </Span>
            </VStack>
          )}
        </HStack>
      </HStack>

      {Footer}
    </div>
  )
}
