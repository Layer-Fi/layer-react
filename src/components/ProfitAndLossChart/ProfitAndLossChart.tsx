import React, { useEffect, useMemo, useState, type FunctionComponent } from 'react'
import { useLayerContext } from '../../contexts/LayerContext'
import { useLinkedAccounts } from '../../hooks/useLinkedAccounts'
import {
  ProfitAndLossSummaryData,
  useProfitAndLossLTM,
} from '../../hooks/useProfitAndLoss/useProfitAndLossLTM'
import { centsToDollars } from '../../models/Money'
import { isDateAllowedToBrowse } from '../../utils/business'
import { Text } from '../Typography'
import { ChartStateCard } from './ChartStateCard'
import { Indicator } from './Indicator'
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
  XAxis,
  Cell,
  Bar,
  LabelList,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  TooltipProps,
  Rectangle,
  YAxis,
  Line,
  ComposedChart,
  ReferenceLine,
} from 'recharts'
import { CategoricalChartFunc } from 'recharts/types/chart/generateCategoricalChart'
import { Props as LegendProps } from 'recharts/types/component/DefaultLegendContent'
import {
  useGlobalDateRange,
  useGlobalDateRangeActions,
} from '../../providers/GlobalDateStore/GlobalDateStoreProvider'

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

  const { start, end } = useGlobalDateRange()
  const { setMonth } = useGlobalDateRangeActions()

  const dateRange = useMemo(() => ({ startDate: start, endDate: end }), [start, end])

  const [localDateRange, setLocalDateRange] = useState(dateRange)
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
      year: localDateRange.startDate.getFullYear(),
      month: localDateRange.startDate.getMonth(),
    }),
    [localDateRange],
  )

  useEffect(() => {
    if (
      Number(dateRange.startDate) !== Number(localDateRange.startDate)
      || Number(dateRange.endDate) !== Number(localDateRange.endDate)
    ) {
      setLocalDateRange(dateRange)
    }
  }, [dateRange])

  const { data, loaded, pullData } = useProfitAndLossLTM({
    currentDate: startOfMonth(Date.now()),
    tagFilter: tagFilter,
  })

  const anyData = useMemo(() => {
    return Boolean(
      data?.find(
        x =>
          x.income !== 0
          || x.costOfGoodsSold !== 0
          || x.grossProfit !== 0
          || x.operatingExpenses !== 0
          || x.profitBeforeTaxes !== 0
          || x.taxes !== 0
          || x.totalExpenses !== 0,
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
    if (loaded === 'complete' && data) {
      const foundCurrent = data.find(
        x =>
          Number(startOfMonth(new Date(x.year, x.month - 1, 1)))
          >= Number(localDateRange.startDate)
          && Number(startOfMonth(new Date(x.year, x.month - 1, 1)))
          < Number(localDateRange.endDate),
      )

      if (!foundCurrent) {
        const newDate = startOfMonth(localDateRange.startDate)
        pullData(newDate)
        return
      }

      const foundBefore = data.find(
        x =>
          Number(startOfMonth(new Date(x.year, x.month - 1, 1)))
          >= Number(sub(localDateRange.startDate, { months: 1 }))
          && Number(startOfMonth(new Date(x.year, x.month - 1, 1)))
          < Number(sub(localDateRange.endDate, { months: 1 })),
      )

      if (!foundBefore) {
        const newDate = startOfMonth(
          sub(localDateRange.startDate, { months: 1 }),
        )
        pullData(newDate)
      }
    }
  }, [localDateRange])

  useEffect(() => {
    const newChartWindow = getChartWindow({
      chartWindow,
      currentYear: localDateRange.startDate.getFullYear(),
      currentMonth: localDateRange.startDate.getMonth() + 1,
    })

    if (
      Number(newChartWindow.start) !== Number(chartWindow.start)
      || Number(newChartWindow.end) !== Number(chartWindow.end)
    ) {
      setChartWindow(newChartWindow)
    }
  }, [localDateRange])

  useEffect(() => {
    if (loaded === 'complete') {
      setTimeout(() => {
        setBarAnimActive(false)
      }, 2000)
    }
  }, [loaded])

  const getMonthName = (pnl: ProfitAndLossSummaryData | undefined) =>
    pnl
      ? format(
        new Date(pnl.year, pnl.month - 1, 1),
        compactView ? 'LLLLL' : 'LLL',
      )
      : ''

  const summarizePnL = (pnl: ProfitAndLossSummaryData | undefined) => ({
    name: getMonthName(pnl),
    revenue: pnl?.income || 0,
    revenueUncategorized: pnl?.uncategorizedInflows || 0,
    expenses: -(pnl?.totalExpenses || 0),
    expensesUncategorized: -(pnl?.uncategorizedOutflows || 0),
    totalExpensesInverse: pnl?.totalExpensesInverse || 0,
    uncategorizedOutflowsInverse: pnl?.uncategorizedOutflowsInverse || 0,
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
  })

  const theData = useMemo(() => {
    if (loaded !== 'complete' || (loaded === 'complete' && !anyData)) {
      const loadingData = []
      const today = Date.now()
      for (let i = 11; i >= 0; i--) {
        const currentDate = sub(today, { months: i })
        loadingData.push({
          name: format(currentDate, compactView ? 'LLLLL' : 'LLL'),
          revenue: 0,
          revenueUncategorized: 0,
          totalExpensesInverse: 0,
          uncategorizedOutflowsInverse: 0,
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
        if (totalExpenses < 0 || x.uncategorizedOutflows < 0) {
          return {
            ...x,
            totalExpenses: totalExpenses < 0 ? 0 : totalExpenses,
            uncategorizedOutflows:
              x.uncategorizedOutflows < 0 ? 0 : x.uncategorizedOutflows,
            totalExpensesInverse: totalExpenses < 0 ? -totalExpenses : 0,
            uncategorizedOutflowsInverse:
              x.uncategorizedOutflows < 0 ? -x.uncategorizedOutflows : 0,
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
  }, [selectionMonth, chartWindow, data, loaded, compactView])

  const onClick: CategoricalChartFunc = ({ activePayload }) => {
    if (loaded !== 'complete' || !anyData) {
      return
    }

    if (activePayload && activePayload.length > 0) {
      const { year, month } = activePayload[0].payload

      const selectedDate = new Date(year, month - 1, 1)
      const isMonthAllowed = isDateAllowedToBrowse(selectedDate, business)

      if (isMonthAllowed) {
        setMonth({ start: selectedDate })
      }
    }
  }

  const CustomTooltip = ({ active, payload }: TooltipProps<number, string>) => {
    if (active && payload && payload.length) {
      const netProfit = payload.find(x => x.dataKey === 'netProfit')?.value ?? 0
      const netProfitClass =
        netProfit > 0 ? 'positive' : netProfit < 0 ? 'negative' : ''
      const revenue = payload.find(x => x.dataKey === 'revenue')?.value ?? 0
      const expenses = payload.find(x => x.dataKey === 'expenses')?.value ?? 0

      return (
        <div className='Layer__chart__tooltip'>
          {loaded !== 'complete'
            ? (
              <Text>Loading...</Text>
            )
            : !anyData
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

  const [animateFrom, setAnimateFrom] = useState(-1)

  return (
    <div className='Layer__chart-wrapper'>
      <ResponsiveContainer
        key={forceRerenderOnDataChange ? JSON.stringify(theData) : 'pnl-chart'}
        className={classNames(
          'Layer__chart-container',
          loaded !== 'complete' && 'Layer__chart-container--loading',
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
          data={theData}
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
              loaded !== 'complete'
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
              loaded !== 'complete'
              && 'Layer__profit-and-loss-chart__bar--loading-anim',
            )}
            xAxisId='expenses'
            stackId='expenses'
          />
          <Bar
            dataKey='totalExpensesInverse'
            barSize={barSize}
            isAnimationActive={barAnimActive}
            animationDuration={100}
            radius={[2, 2, 0, 0]}
            className='Layer__profit-and-loss-chart__bar--expenses'
            xAxisId='revenue'
            stackId='revenue'
          >
            {theData?.map((entry) => {
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
                  setCustomCursorSize={(width, height, x) =>
                    setCustomCursorSize({ width, height, x })}
                  customCursorSize={customCursorSize}
                  animateFrom={animateFrom}
                  setAnimateFrom={setAnimateFrom}
                />
              )}
            />
            {theData?.map((entry) => {
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
            dataKey='uncategorizedOutflowsInverse'
            barSize={barSize}
            isAnimationActive={barAnimActive}
            animationDuration={100}
            radius={[2, 2, 0, 0]}
            className='Layer__profit-and-loss-chart__bar--expenses-uncategorized'
            xAxisId='revenue'
            stackId='revenue'
          >
            {theData?.map((entry) => {
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
            {theData?.map((entry) => {
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
            {theData.map(entry => (
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
            {theData?.map((entry) => {
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

      {isSyncing && !anyData ? <ChartStateCard /> : null}
    </div>
  )
}
