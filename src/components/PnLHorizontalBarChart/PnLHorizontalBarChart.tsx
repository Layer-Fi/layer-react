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
import { HStack, VStack } from '@ui/Stack/Stack'
import { MoneySpan } from '@ui/Typography/MoneySpan'
import { Span } from '@ui/Typography/Text'
import {
  getStripePatternDarkFill,
  getStripePatternFill,
  ProfitAndLossChartPatternDefs,
} from '@components/ProfitAndLossChart/ProfitAndLossChartPatternDefs'
import { TransactionsToReview } from '@views/AccountingOverview/internal/TransactionsToReview'

import './pnLHorizontalBarChart.scss'

type PnLHorizontalBarChartDatum = {
  id: 'income' | 'expenses'
  label: 'Revenue' | 'Expenses'
  categorized: number
  uncategorized: number
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
      total: categorizedRevenue + uncategorizedRevenue,
      categorizedColor: CATEGORIZED_REVENUE_COLOR,
      uncategorizedColor: getStripePatternFill(`horizontal-bar-${'income'}`),
    }, {
      id: 'expenses',
      label: 'Expenses',
      categorized: categorizedExpenses,
      uncategorized: uncategorizedExpenses,
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
      </VStack>
      <HStack className='Layer__PnLHorizontalBarChart__net-profit-row' justify='space-between' align='center'>
        <VStack gap='4xs' className='Layer__PnLHorizontalBarChart__net-profit'>
          <Span size='xs' variant='subtle' className='Layer__PnLHorizontalBarChart__net-profit-label'>Net Profit</Span>
          <MoneySpan slot='amount' amount={netProfit} size='xl' weight='bold' />
        </VStack>
        {onTransactionsToReviewClick && (
          <TransactionsToReview onClick={onTransactionsToReviewClick} />
        )}
      </HStack>
      <VStack className='Layer__PnLHorizontalBarChart__bars-container' gap='sm'>
        {data.map((item) => {
          return (
            <VStack key={item.id} className='Layer__PnLHorizontalBarChart__row' gap='xs'>
              <VStack gap='4xs' className='Layer__PnLHorizontalBarChart__row-summary'>
                <Span size='xs' variant='subtle' className='Layer__PnLHorizontalBarChart__row-label'>{item.label}</Span>
                <Span size='xl' weight='bold'>{formatAmount(item.categorized)}</Span>
              </VStack>
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
    </VStack>
  )
}
