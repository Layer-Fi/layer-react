import { type FunctionComponent, useCallback, useEffect, useMemo, useState } from 'react'
import classNames from 'classnames'
import {
  add,
  differenceInMonths,
  endOfMonth,
  format,
  startOfMonth,
  sub,
} from 'date-fns'
import {
  Bar,
  CartesianGrid,
  Cell,
  ComposedChart,
  LabelList,
  Legend,
  Line,
  Rectangle,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  type TooltipProps,
  XAxis,
  YAxis,
} from 'recharts'
import { type CategoricalChartFunc } from 'recharts/types/chart/generateCategoricalChart'
import { type Props as LegendProps } from 'recharts/types/component/DefaultLegendContent'

import { centsToDollars } from '@models/Money'
import { MONTH_FORMAT_ABBREVIATED, MONTH_FORMAT_NARROW } from '@config/general'
import { isDateAllowedToBrowse } from '@utils/business'
import { useLinkedAccounts } from '@hooks/useLinkedAccounts/useLinkedAccounts'
import {
  type ProfitAndLossSummaryData,
  useProfitAndLossLTM,
} from '@hooks/useProfitAndLoss/useProfitAndLossLTM'
import {
  useGlobalDateRange,
  useGlobalDateRangeActions,
} from '@providers/GlobalDateStore/GlobalDateStoreProvider'
import { useLayerContext } from '@contexts/LayerContext/LayerContext'
import { ChartStateCard } from '@components/ProfitAndLossChart/ChartStateCard'
import { Indicator } from '@components/ProfitAndLossChart/Indicator'
import { Text } from '@components/Typography/Text'

type ChartDataPoint = {
  name: string
  revenue: number
  revenueUncategorized: number
  expenses: number
  expensesForTooltip: number
  expensesUncategorized: number
  netProfit: number
  selected: boolean
  year: number | undefined
  month: number | undefined
  base: number
  loading: number
  loadingExpenses: number
  totalExpensesForBarChartDisplay?: number
  uncategorizedOutflowsForBarChartDisplay?: number
}

const getChartWindow = ({
  chartWindow,
  currentYear,
  currentMonth,
}: {
  chartWindow: { start: Date, end: Date }
  currentYear: number
  currentMonth: number
}) => {
  const today = startOfMonth(Date.now())
  const yearAgo = sub(today, { months: 11 })
  const current = startOfMonth(new Date(currentYear, currentMonth - 1, 1))

  if (
    differenceInMonths(startOfMonth(chartWindow.start), current) < 0
    && differenceInMonths(startOfMonth(chartWindow.end), current) > 1
  ) {
    return chartWindow
  }

  if (differenceInMonths(startOfMonth(chartWindow.start), current) === 0) {
    return {
      start: startOfMonth(sub(current, { months: 1 })),
      end: endOfMonth(add(current, { months: 11 })),
    }
  }

  if (
    differenceInMonths(endOfMonth(chartWindow.end), endOfMonth(current))
    === 1
    && differenceInMonths(today, current) >= 1
  ) {
    return {
      start: startOfMonth(sub(current, { months: 10 })),
      end: endOfMonth(add(current, { months: 2 })),
    }
  }

  if (
    differenceInMonths(current, startOfMonth(chartWindow.end)) === 0
    && differenceInMonths(current, startOfMonth(today)) > 0
  ) {
    return {
      start: startOfMonth(sub(current, { months: 11 })),
      end: endOfMonth(add(current, { months: 1 })),
    }
  }

  if (current >= yearAgo) {
    return {
      start: startOfMonth(yearAgo),
      end: endOfMonth(today),
    }
  }

  if (Number(current) > Number(chartWindow.end)) {
    return {
      start: startOfMonth(sub(current, { months: 12 })),
      end: endOfMonth(current),
    }
  }

  if (differenceInMonths(current, startOfMonth(chartWindow.start)) < 0) {
    return {
      start: startOfMonth(current),
      end: endOfMonth(add(current, { months: 11 })),
    }
  }

  return chartWindow
}

const getLoadingValue = (data?: ProfitAndLossSummaryData[]) => {
  if (!data) {
    return 10000
  }

  let max = 0

  data.forEach((x) => {
    const current = Math.max(
      Math.abs(x.income),
      Math.abs(Math.abs((x?.income || 0) - (x?.netProfit || 0))),
    )
    if (current > max) {
      max = current
    }
  })

  return max === 0 ? 10000 : max * 0.6
}

export interface Props {
  forceRerenderOnDataChange?: boolean
  tagFilter?: {
    key: string
    values: string[]
  }
}

export const ProfitAndLossChart = ({
  forceRerenderOnDataChange = false,
  tagFilter = undefined,
}: Props) => {
  const [compactView, setCompactView] = useState(false)
  const barSize = compactView ? 10 : 20

  const { getColor, business } = useLayerContext()

  const dateRange = useGlobalDateRange({ dateSelectionMode: 'month' })
  const { setMonth } = useGlobalDateRangeActions()

  const [customCursorSize, setCustomCursorSize] = useState({
    width: 0,
    height: 0,
    x: 0,
  })
  const [barAnimActive, setBarAnimActive] = useState(true)
  const [chartWindow, setChartWindow] = useState({
    start: startOfMonth(sub(Date.now(), { months: 11 })),
    end: endOfMonth(Date.now()),
  })

  const selectionMonth = useMemo(
    () => ({
      year: dateRange.startDate.getFullYear(),
      month: dateRange.startDate.getMonth(),
    }),
    [dateRange],
  )

  const { data, isLoading, setDate } = useProfitAndLossLTM({
    currentDate: startOfMonth(Date.now()),
    tagFilter: tagFilter,
  })

  const hasLoadedData = !isLoading && data
  const hasNonZeroData = useMemo(() => {
    return Boolean(
      data?.find(
        x =>
          x.income !== 0
          || x.costOfGoodsSold !== 0
          || x.grossProfit !== 0
          || x.operatingExpenses !== 0
          || x.profitBeforeTaxes !== 0
          || x.taxes !== 0
          || x.totalExpenses !== 0
          || x.uncategorizedInflows !== 0
          || x.uncategorizedOutflows !== 0,
      ),
    )
  }, [data])

  const { data: linkedAccounts } = useLinkedAccounts()

  const isSyncing = useMemo(
    () => Boolean(linkedAccounts?.some(item => item.is_syncing)),
    [linkedAccounts],
  )

  const loadingValue = useMemo(() => getLoadingValue(data), [data])

  useEffect(() => {
    if (hasLoadedData) {
      const foundCurrent = data.find(
        x =>
          Number(startOfMonth(new Date(x.year, x.month - 1, 1)))
          >= Number(dateRange.startDate)
          && Number(startOfMonth(new Date(x.year, x.month - 1, 1)))
          < Number(dateRange.endDate),
      )

      if (!foundCurrent) {
        const newDate = startOfMonth(dateRange.startDate)
        setDate(newDate)
        return
      }

      const foundBefore = data.find(
        x =>
          Number(startOfMonth(new Date(x.year, x.month - 1, 1)))
          >= Number(sub(dateRange.startDate, { months: 1 }))
          && Number(startOfMonth(new Date(x.year, x.month - 1, 1)))
          < Number(sub(dateRange.endDate, { months: 1 })),
      )

      if (!foundBefore) {
        const newDate = startOfMonth(
          sub(dateRange.startDate, { months: 1 }),
        )
        setDate(newDate)
      }
    }
  }, [data, dateRange, hasLoadedData, isLoading, setDate])

  useEffect(() => {
    const newChartWindow = getChartWindow({
      chartWindow,
      currentYear: dateRange.startDate.getFullYear(),
      currentMonth: dateRange.startDate.getMonth() + 1,
    })

    if (
      Number(newChartWindow.start) !== Number(chartWindow.start)
      || Number(newChartWindow.end) !== Number(chartWindow.end)
    ) {
      setChartWindow(newChartWindow)
    }
  }, [chartWindow, dateRange])

  useEffect(() => {
    if (hasLoadedData) {
      setTimeout(() => {
        setBarAnimActive(false)
      }, 2000)
    }
  }, [hasLoadedData])

  const getMonthName = useCallback((pnl: ProfitAndLossSummaryData | undefined) =>
    pnl
      ? format(
        new Date(pnl.year, pnl.month - 1, 1),
        compactView ? MONTH_FORMAT_NARROW : MONTH_FORMAT_ABBREVIATED,
      )
      : '', [compactView])

  const summarizePnL = useCallback((pnl: ProfitAndLossSummaryData | undefined) => ({
    name: getMonthName(pnl),
    revenue: pnl?.income || 0,
    revenueUncategorized: pnl?.uncategorizedInflows || 0,
    expenses: -(pnl?.totalExpenses || 0),
    expensesForTooltip: pnl?.totalExpenses || 0,
    expensesUncategorized: -(pnl?.uncategorizedOutflows || 0),
    netProfit: pnl?.netProfit || 0,
    selected:
      !!pnl
      && pnl.month === selectionMonth.month + 1
      && pnl.year === selectionMonth.year,
    year: pnl?.year,
    month: pnl?.month,
    base: 0,
    loading: pnl?.isLoading ? loadingValue : 0,
    loadingExpenses: pnl?.isLoading ? -loadingValue : 0,
  }), [getMonthName, loadingValue, selectionMonth.month, selectionMonth.year])

  const dataOrPlaceholderData = useMemo(() => {
    if (isLoading || !hasNonZeroData) {
      const loadingData = []
      const today = Date.now()
      for (let i = 11; i >= 0; i--) {
        const currentDate = sub(today, { months: i })
        loadingData.push({
          name: format(currentDate, compactView ? MONTH_FORMAT_NARROW : MONTH_FORMAT_ABBREVIATED),
          revenue: 0,
          revenueUncategorized: 0,
          totalExpensesForBarChartDisplay: 0,
          uncategorizedOutflowsForBarChartDisplay: 0,
          expenses: 0,
          expensesUncategorized: 0,
          netProfit: 0,
          selected: false,
          year: currentDate.getFullYear(),
          month: currentDate.getMonth() + 1,
          loading: 1000 * Math.pow(-1, i + 1) * (((i + 1) % 12) + 1) + 90000,
          loadingExpenses:
            -1000 * Math.pow(-1, i + 1) * (((i + 1) % 2) + 1) - 90000,
          base: 0,
        })
      }
      return loadingData
    }

    return data
      ?.map((x) => {
        const totalExpenses = x.totalExpenses || 0
        const uncategorizedOutflows = x.uncategorizedOutflows || 0
        if (totalExpenses < 0 || uncategorizedOutflows < 0) {
          return {
            ...x,
            totalExpensesForBarChartDisplay: totalExpenses < 0 ? -totalExpenses : 0,
            uncategorizedOutflowsForBarChartDisplay:
              uncategorizedOutflows < 0 ? -uncategorizedOutflows : 0,
          }
        }

        return x
      })
      ?.filter(
        x =>
          differenceInMonths(
            startOfMonth(new Date(x.year, x.month - 1, 1)),
            chartWindow.start,
          ) >= 0
          && differenceInMonths(
            startOfMonth(new Date(x.year, x.month - 1, 1)),
            chartWindow.start,
          ) < 12
          && differenceInMonths(
            chartWindow.end,
            startOfMonth(new Date(x.year, x.month - 1, 1)),
          ) >= 0
          && differenceInMonths(
            chartWindow.end,
            startOfMonth(new Date(x.year, x.month - 1, 1)),
          ) <= 12,
      )
      .map(x => summarizePnL(x))
  }, [isLoading, hasNonZeroData, data, compactView, chartWindow, summarizePnL])

  const onClick: CategoricalChartFunc = ({ activePayload }) => {
    if (!hasLoadedData || !hasNonZeroData) {
      return
    }

    if (activePayload && activePayload.length > 0) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      const { year, month } = activePayload[0].payload

      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      const selectedDate = new Date(year, month - 1, 1)
      const isMonthAllowed = isDateAllowedToBrowse(selectedDate, business)

      if (isMonthAllowed) {
        setMonth({ startDate: selectedDate })
      }
    }
  }

  const CustomTooltip = ({ active, payload: hoveredDataPoints }: TooltipProps<number, string>) => {
    if (active && hoveredDataPoints && hoveredDataPoints.length) {
      const dataRow = hoveredDataPoints[0]?.payload as ChartDataPoint | undefined
      const revenue = dataRow?.revenue ?? 0
      const expenses = dataRow?.expensesForTooltip ?? 0
      const netProfit = dataRow?.netProfit ?? 0
      const netProfitClass =
        netProfit > 0 ? 'positive' : netProfit < 0 ? 'negative' : ''

      return (
        <div className='Layer__chart__tooltip'>
          {!hasLoadedData
            ? (
              <Text>Loading...</Text>
            )
            : !hasNonZeroData
              ? (
                <Text>No data yet</Text>
              )
              : (
                <ul className='Layer__chart__tooltip-list'>
                  <li>
                    <label className='Layer__chart__tooltip-label'>Revenue</label>
                    <span className='Layer__chart__tooltip-value'>
                      $
                      {centsToDollars(revenue)}
                    </span>
                  </li>
                  <li>
                    <label className='Layer__chart__tooltip-label'>Expenses</label>
                    <span className='Layer__chart__tooltip-value'>
                      {expenses < 0 ? '-' : ''}
                      $
                      {centsToDollars(Math.abs(expenses))}
                    </span>
                  </li>
                  <li>
                    <label className='Layer__chart__tooltip-label'>
                      Net Profit
                    </label>
                    <span
                      className={`Layer__chart__tooltip-value ${netProfitClass}`}
                    >
                      $
                      {centsToDollars(netProfit)}
                    </span>
                  </li>
                </ul>
              )}
        </div>
      )
    }

    return null
  }

  const formatYAxisValue = (value?: string | number) => {
    if (!value) {
      return value
    }

    try {
      let suffix = ''
      const base = Number(value) / 100
      let val = base

      if (Math.abs(base) >= 1000000000) {
        suffix = 'B'
        val = base / 1000000000
      }
      else if (Math.abs(base) >= 1000000) {
        suffix = 'M'
        val = base / 1000000
      }
      else if (Math.abs(base) >= 1000) {
        suffix = 'k'
        val = base / 1000
      }
      return `${val}${suffix}`
    }
    catch (_err) {
      return value
    }
  }

  const renderLegend = (props: LegendProps) => {
    return (
      <ul className='Layer__chart-legend-list'>
        {props.payload?.map((entry, idx) => {
          if (entry.id === 'UncategorizedLegend') {
            return (
              <li
                key={`legend-item-${idx}`}
                className={`recharts-legend-item legend-item-${idx}`}
              >
                <svg
                  className='recharts-surface'
                  width='15'
                  height='15'
                  viewBox='0 0 15 15'
                  style={{
                    display: 'inline-block',
                    verticalAlign: 'middle',
                    marginRight: 4,
                  }}
                >
                  <circle
                    cx='7'
                    cy='7'
                    r='7'
                    fill='url(#layer-bar-stripe-pattern-dark)'
                  />
                </svg>
                {entry.value}
              </li>
            )
          }
          return (
            <li
              key={`legend-item-${idx}`}
              className={`recharts-legend-item legend-item-${idx}`}
            >
              <svg
                className='recharts-surface'
                width='15'
                height='15'
                viewBox='0 0 15 15'
                style={{
                  display: 'inline-block',
                  verticalAlign: 'middle',
                  marginRight: 4,
                }}
              >
                <circle cx='7' cy='7' r='7' />
              </svg>
              {entry.value}
            </li>
          )
        })}
      </ul>
    )
  }

  const CustomizedYTick = (
    {
      verticalAnchor: _verticalAnchor,
      visibleTicksCount: _visibleTicksCount,
      tickFormatter: _tickFormatter,
      payload,
      ...restProps
    }: {
      verticalAnchor: unknown
      visibleTicksCount: unknown
      tickFormatter: unknown
      payload: { value: string | number }
    }) => {
    return (
      <text {...restProps} className='Layer__chart_y-axis-tick'>
        <tspan dy='0.355em'>{formatYAxisValue(payload.value)}</tspan>
      </text>
    )
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const CustomizedCursor: FunctionComponent<any> = (
    { points }: { points: [{ x: number, y: number }] },
  ) => {
    const { width, height } = customCursorSize

    return (
      <Rectangle
        fill='#F7F8FA'
        stroke='none'
        x={points[0].x - width / 2}
        y={points[0].y}
        width={width}
        height={height}
        radius={6}
        className='Layer__chart__tooltip-cursor'
      />
    )
  }

  return (
    <div className='Layer__chart-wrapper'>
      <ResponsiveContainer
        key={forceRerenderOnDataChange ? JSON.stringify(dataOrPlaceholderData) : 'pnl-chart'}
        className={classNames(
          'Layer__chart-container',
          !hasLoadedData && 'Layer__chart-container--loading',
        )}
        width='100%'
        height='100%'
        onResize={(width) => {
          if (width && width < 620 && !compactView) {
            setCompactView(true)
            return
          }

          if (width && width >= 620 && compactView) {
            setCompactView(false)
            return
          }
        }}
      >
        <ComposedChart
          margin={{ left: 12, right: 12, bottom: 12 }}
          data={dataOrPlaceholderData}
          onClick={onClick}
          className='Layer__profit-and-loss-chart'
        >
          <defs>
            <pattern
              id='layer-bar-stripe-pattern'
              x='0'
              y='0'
              width='4'
              height='4'
              patternTransform='rotate(45)'
              patternUnits='userSpaceOnUse'
            >
              <rect width='4' height='4' opacity={0.16} />
              <line x1='0' y='0' x2='0' y2='4' strokeWidth='2' />
            </pattern>

            <pattern
              id='layer-bar-stripe-pattern-dark'
              x='0'
              y='0'
              width='4'
              height='4'
              patternTransform='rotate(45)'
              patternUnits='userSpaceOnUse'
            >
              <rect width='4' height='4' opacity={0.16} />
              <line x1='0' y='0' x2='0' y2='4' strokeWidth='2' />
            </pattern>
          </defs>
          <ReferenceLine
            y={0}
            stroke={getColor(300)?.hex ?? '#EBEDF0'}
            xAxisId='revenue'
          />
          <Tooltip
            wrapperClassName='Layer__chart__tooltip-wrapper'
            content={<CustomTooltip />}
            cursor={<CustomizedCursor />}
            animationDuration={100}
            animationEasing='ease-out'
          />
          <CartesianGrid
            vertical={false}
            stroke={getColor(200)?.hex ?? '#fff'}
            strokeDasharray='5 5'
          />
          <Legend
            verticalAlign='top'
            align='right'
            content={renderLegend}
            payload={[
              {
                value: 'Revenue',
                type: 'circle',
                id: 'IncomeLegend',
              },
              {
                value: 'Expenses',
                type: 'circle',
                id: 'ExpensesLegend',
              },
              {
                value: 'Uncategorized',
                type: 'circle',
                id: 'UncategorizedLegend',
              },
            ]}
          />
          <XAxis dataKey='name' xAxisId='revenue' tickLine={false} />
          <XAxis dataKey='name' xAxisId='expenses' tickLine={false} hide />
          <YAxis tick={CustomizedYTick} />
          <Bar
            dataKey='loading'
            barSize={barSize}
            isAnimationActive={barAnimActive}
            animationDuration={100}
            radius={[2, 2, 0, 0]}
            className={classNames(
              'Layer__profit-and-loss-chart__bar--loading',
              !hasLoadedData
              && 'Layer__profit-and-loss-chart__bar--loading-anim',
            )}
            xAxisId='revenue'
            stackId='revenue'
          />
          <Bar
            dataKey='loadingExpenses'
            barSize={barSize}
            isAnimationActive={barAnimActive}
            animationDuration={100}
            radius={[2, 2, 0, 0]}
            className={classNames(
              'Layer__profit-and-loss-chart__bar--loading',
              !hasLoadedData
              && 'Layer__profit-and-loss-chart__bar--loading-anim',
            )}
            xAxisId='expenses'
            stackId='expenses'
          />
          <Bar
            dataKey='totalExpensesForBarChartDisplay'
            barSize={barSize}
            isAnimationActive={barAnimActive}
            animationDuration={100}
            radius={[2, 2, 0, 0]}
            className='Layer__profit-and-loss-chart__bar--expenses'
            xAxisId='revenue'
            stackId='revenue'
          >
            {dataOrPlaceholderData.map((entry) => {
              return (
                <Cell
                  key={entry.name}
                  fill='url(#layer-bar-stripe-pattern-dark)'
                />
              )
            })}
          </Bar>
          <Bar
            dataKey='revenue'
            barSize={barSize}
            isAnimationActive={barAnimActive}
            animationDuration={100}
            className='Layer__profit-and-loss-chart__bar--income'
            xAxisId='revenue'
            stackId='revenue'
          >
            <LabelList
              content={(
                <Indicator
                  setCustomCursorSize={(width, height, x) => setCustomCursorSize({ width, height, x })}
                  customCursorSize={customCursorSize}
                />
              )}
            />
            {dataOrPlaceholderData.map((entry) => {
              return (
                <Cell
                  key={entry.name}
                  className={
                    entry.selected
                      ? 'Layer__profit-and-loss-chart__cell--selected'
                      : ''
                  }
                />
              )
            })}
          </Bar>
          <Bar
            dataKey='uncategorizedOutflowsForBarChartDisplay'
            barSize={barSize}
            isAnimationActive={barAnimActive}
            animationDuration={100}
            radius={[2, 2, 0, 0]}
            className='Layer__profit-and-loss-chart__bar--expenses-uncategorized'
            xAxisId='revenue'
            stackId='revenue'
          >
            {dataOrPlaceholderData.map((entry) => {
              return (
                <Cell
                  key={entry.name}
                  fill='url(#layer-bar-stripe-pattern-dark)'
                />
              )
            })}
          </Bar>
          <Bar
            dataKey='revenueUncategorized'
            barSize={barSize}
            isAnimationActive={barAnimActive}
            animationDuration={100}
            radius={[2, 2, 0, 0]}
            className='Layer__profit-and-loss-chart__bar--income-uncategorized'
            xAxisId='revenue'
            stackId='revenue'
          >
            {dataOrPlaceholderData.map((entry) => {
              return (
                <Cell key={entry.name} fill='url(#layer-bar-stripe-pattern)' />
              )
            })}
          </Bar>
          <Bar
            dataKey='expenses'
            barSize={barSize}
            isAnimationActive={barAnimActive}
            animationDuration={100}
            className='Layer__profit-and-loss-chart__bar--expenses'
            xAxisId='expenses'
            stackId='expenses'
          >
            {dataOrPlaceholderData.map(entry => (
              <Cell
                key={entry.name}
                className={
                  entry.selected
                    ? 'Layer__profit-and-loss-chart__cell--selected'
                    : ''
                }
              />
            ))}
          </Bar>
          <Bar
            dataKey='expensesUncategorized'
            barSize={barSize}
            isAnimationActive={barAnimActive}
            animationDuration={100}
            radius={[2, 2, 0, 0]}
            className='Layer__profit-and-loss-chart__bar--expenses-uncategorized'
            xAxisId='expenses'
            stackId='expenses'
          >
            {dataOrPlaceholderData.map((entry) => {
              return (
                <Cell
                  key={entry.name}
                  fill='url(#layer-bar-stripe-pattern-dark)'
                />
              )
            })}
          </Bar>

          <Line
            dot={true}
            strokeWidth={1}
            type='linear'
            dataKey='netProfit'
            stroke={getColor(1000)?.hex ?? '#000'}
            name='Net profit'
            xAxisId='revenue'
            animationDuration={20}
          />
        </ComposedChart>
      </ResponsiveContainer>

      {isSyncing && !hasNonZeroData ? <ChartStateCard /> : null}
    </div>
  )
}
