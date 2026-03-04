import { useContext, useMemo } from 'react'
import classNames from 'classnames'
import { format } from 'date-fns'
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from 'recharts'

import { centsToDollars } from '@models/Money'
import { useGlobalDateMode, useGlobalDateRange } from '@providers/GlobalDateStore/GlobalDateStoreProvider'
import { ProfitAndLossContext } from '@contexts/ProfitAndLossContext/ProfitAndLossContext'
import BellIcon from '@icons/Bell'
import CheckIcon from '@icons/Check'
import ChevronRight from '@icons/ChevronRight'
import { HStack, VStack } from '@ui/Stack/Stack'
import { MoneySpan } from '@ui/Typography/MoneySpan'
import { Span } from '@ui/Typography/Text'
import { Badge, BadgeSize, BadgeVariant } from '@components/Badge/Badge'
import { TextButton } from '@components/Button/TextButton'
import {
  getStripePatternDarkFill,
  getStripePatternFill,
  ProfitAndLossChartPatternDefs,
} from '@components/ProfitAndLossChart/ProfitAndLossChartPatternDefs'

import './pnLHorizontalBarChart.scss'

type PnLHorizontalBarChartDatum = {
  id: 'income' | 'expenses'
  label: 'Revenue' | 'Expenses'
  categorized: number
  uncategorized: number
  uncategorizedTransactionCount?: number
  total: number
  categorizedColor: string
  uncategorizedColor: string
}

const BAR_CHART_HEIGHT = 28
const CATEGORIZED_REVENUE_COLOR = 'var(--bar-color-income)'
const CATEGORIZED_EXPENSES_COLOR = 'var(--bar-color-expenses)'

const PNL_HORIZONTAL_BAR_CHART_LEGEND_PAYLOAD = [
  {
    value: 'Revenue',
    className: 'Layer__PnLHorizontalBarChart__legend-item--income',
    fill: CATEGORIZED_REVENUE_COLOR,
  },
  {
    value: 'Expenses',
    className: 'Layer__PnLHorizontalBarChart__legend-item--expenses',
    fill: CATEGORIZED_EXPENSES_COLOR,
  },
  {
    value: 'Uncategorized',
    className: 'Layer__PnLHorizontalBarChart__legend-item--uncategorized',
    fill: getStripePatternDarkFill('horizontal-bar-legend'),
  },
]

const formatAmount = (value: number) => `$${centsToDollars(Math.abs(value))}`

const LegendIcon = ({ fill }: { fill?: string }) => (
  <svg
    className='Layer__PnLHorizontalBarChart__legend-icon recharts-surface'
    width='15'
    height='15'
    viewBox='0 0 15 15'
  >
    <circle cx='7' cy='7' r='7' fill={fill} />
  </svg>
)

type PnLHorizontalBarChartLegendProps = {
  className?: string
}

export const PnLHorizontalBarChartLegend = ({ className }: PnLHorizontalBarChartLegendProps) => (
  <HStack className={classNames('Layer__PnLHorizontalBarChart__legend Layer__chart-legend-list', className)}>
    <svg width='0' height='0' style={{ position: 'absolute' }}>
      <ProfitAndLossChartPatternDefs idPrefix='horizontal-bar-legend' />
    </svg>
    {PNL_HORIZONTAL_BAR_CHART_LEGEND_PAYLOAD.map(item => (
      <HStack
        key={item.value}
        align='center'
        className={classNames('recharts-legend-item', item.className)}
      >
        <LegendIcon fill={item.fill} />
        <Span className='recharts-legend-item-text'>{item.value}</Span>
      </HStack>
    ))}
  </HStack>
)

type PnLHorizontalBarChartProps = {
  onTransactionsToReviewClick?: () => void
}

export const PnLHorizontalBarChart = ({ onTransactionsToReviewClick }: PnLHorizontalBarChartProps) => {
  const dateSelectionMode = useGlobalDateMode()
  const dateRange = useGlobalDateRange({ dateSelectionMode })
  const { data: profitAndLossData } = useContext(ProfitAndLossContext)

  const transactionCounts = profitAndLossData?.transactionCounts
  const netProfit = profitAndLossData?.netProfit ?? 0

  const data = useMemo<PnLHorizontalBarChartDatum[]>(() => {
    const categorizedRevenue = Math.abs(profitAndLossData?.income?.value ?? 0)
    const uncategorizedRevenue = Math.abs(profitAndLossData?.uncategorizedInflows?.value ?? 0)
    const categorizedExpenses = Math.abs(
      (profitAndLossData?.costOfGoodsSold?.value ?? 0)
      + (profitAndLossData?.expenses?.value ?? 0)
      + (profitAndLossData?.taxes?.value ?? 0),
    )
    const uncategorizedExpenses = Math.abs(profitAndLossData?.uncategorizedOutflows?.value ?? 0)

    return [{
      id: 'income',
      label: 'Revenue',
      categorized: categorizedRevenue,
      uncategorized: uncategorizedRevenue,
      uncategorizedTransactionCount: transactionCounts?.uncategorizedInflows,
      total: categorizedRevenue + uncategorizedRevenue,
      categorizedColor: CATEGORIZED_REVENUE_COLOR,
      uncategorizedColor: getStripePatternFill(`horizontal-bar-${'income'}`),
    }, {
      id: 'expenses',
      label: 'Expenses',
      categorized: categorizedExpenses,
      uncategorized: uncategorizedExpenses,
      uncategorizedTransactionCount: transactionCounts?.uncategorizedOutflows,
      total: categorizedExpenses + uncategorizedExpenses,
      categorizedColor: CATEGORIZED_EXPENSES_COLOR,
      uncategorizedColor: getStripePatternDarkFill(`horizontal-bar-${'expenses'}`),
    }]
  }, [
    profitAndLossData?.costOfGoodsSold?.value,
    profitAndLossData?.expenses?.value,
    profitAndLossData?.income?.value,
    profitAndLossData?.taxes?.value,
    profitAndLossData?.uncategorizedInflows?.value,
    profitAndLossData?.uncategorizedOutflows?.value,
    transactionCounts,
  ])

  const maxTotal = useMemo(() => {
    return Math.max(...data.map(item => item.total), 1)
  }, [data])

  return (
    <VStack className='Layer__PnLHorizontalBarChart' gap='sm'>
      <VStack className='Layer__PnLHorizontalBarChart__header' gap='2xs'>
        <Span size='sm' variant='subtle'>
          {`${format(dateRange.startDate, 'MMM d, yyyy')} - ${format(dateRange.endDate, 'MMM d, yyyy')}`}
        </Span>
        <VStack gap='4xs' className='Layer__PnLHorizontalBarChart__net-profit'>
          <Span size='xs' variant='subtle' className='Layer__PnLHorizontalBarChart__net-profit-label'>Net Profit</Span>
          <MoneySpan slot='amount' amount={netProfit} size='xl' weight='bold' />
        </VStack>
      </VStack>
      <VStack className='Layer__PnLHorizontalBarChart__bars-container' gap='sm'>
        {data.map((item) => {
          const showUncategorizedStatus = item.uncategorized > 0
          const categorizedPercentage = item.total > 0
            ? Math.round((item.categorized / item.total) * 100)
            : (showUncategorizedStatus ? 0 : 100)
          const statusText = showUncategorizedStatus
            ? `${formatAmount(item.uncategorized)} uncategorized${item.uncategorizedTransactionCount !== undefined
              ? ` (${item.uncategorizedTransactionCount} ${item.uncategorizedTransactionCount === 1 ? 'transaction' : 'transactions'})`
              : ''}`
            : 'Fully categorized'

          return (
            <VStack key={item.id} className='Layer__PnLHorizontalBarChart__row' gap='xs'>
              <HStack justify='space-between' align='start' className='Layer__PnLHorizontalBarChart__row-header'>
                <VStack gap='4xs' className='Layer__PnLHorizontalBarChart__row-summary'>
                  <Span size='xs' variant='subtle' className='Layer__PnLHorizontalBarChart__row-label'>{item.label}</Span>
                  <Span size='xl' weight='bold'>{formatAmount(item.categorized)}</Span>
                </VStack>
                <VStack gap='2xs' align='end' className='Layer__PnLHorizontalBarChart__status-group'>
                  <Span size='sm' variant='subtle' className='Layer__PnLHorizontalBarChart__completion'>
                    {`${categorizedPercentage}% categorized`}
                  </Span>
                  <Badge
                    size={BadgeSize.SMALL}
                    variant={showUncategorizedStatus ? BadgeVariant.WARNING : BadgeVariant.SUCCESS}
                    icon={showUncategorizedStatus ? <BellIcon size={12} /> : <CheckIcon size={12} />}
                  >
                    {statusText}
                  </Badge>
                </VStack>
              </HStack>
              <HStack className='Layer__PnLHorizontalBarChart__bar-wrapper'>
                <ResponsiveContainer width='100%' height={BAR_CHART_HEIGHT}>
                  <BarChart data={[item]} layout='vertical' className='Layer__PnLHorizontalBarChart__chart'>
                    <ProfitAndLossChartPatternDefs idPrefix={`horizontal-bar-${item.id}`} />
                    <XAxis type='number' hide domain={[0, maxTotal]} />
                    <YAxis type='category' dataKey='label' hide />
                    <Bar
                      dataKey='categorized'
                      stackId='total'
                      fill={item.categorizedColor}
                      radius={item.uncategorized > 0 ? [6, 0, 0, 6] : [6, 6, 6, 6]}
                      isAnimationActive={false}
                    />
                    <Bar
                      dataKey='uncategorized'
                      stackId='total'
                      fill={item.uncategorizedColor}
                      radius={[0, 6, 6, 0]}
                      isAnimationActive={false}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </HStack>
            </VStack>
          )
        })}
      </VStack>
      {onTransactionsToReviewClick && (
        <HStack justify='end' className='Layer__PnLHorizontalBarChart__cta'>
          <TextButton onClick={onTransactionsToReviewClick} className='Layer__PnLHorizontalBarChart__cta-button'>
            <Span size='sm'>Review transactions</Span>
            <ChevronRight width={16} height={16} />
          </TextButton>
        </HStack>
      )}
    </VStack>
  )
}
