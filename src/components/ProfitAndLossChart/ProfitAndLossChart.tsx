import React, { useContext, useEffect, useMemo, useState } from 'react'
import { useLayerContext } from '../../hooks/useLayerContext'
import { useProfitAndLossLTM } from '../../hooks/useProfitAndLoss/useProfitAndLossLTM'
import { centsToDollars } from '../../models/Money'
import { ProfitAndLossSummary } from '../../types/profit_and_loss'
import { capitalizeFirstLetter } from '../../utils/format'
import { ProfitAndLoss as PNL } from '../ProfitAndLoss'
import { Text } from '../Typography'
import { Indicator } from './Indicator'
import classNames from 'classnames'
import { add, endOfMonth, format, startOfMonth, sub } from 'date-fns'
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

const getChartWindow = ({
  chartWindow,
  currentYear,
  currentMonth,
}: {
  chartWindow: { start: Date; end: Date }
  currentYear: number
  currentMonth: number
}) => {
  const today = endOfMonth(Date.now())
  const yearAgo = sub(today, { months: 11 })
  const current = new Date(currentYear, currentMonth, 0)

  if (current >= yearAgo) {
    return {
      start: startOfMonth(yearAgo),
      end: today,
    }
  }

  if (Number(current) > Number(chartWindow.end)) {
    return {
      start: startOfMonth(sub(current, { months: 11 })),
      end: endOfMonth(current),
    }
  }

  if (Number(current) < Number(chartWindow.start)) {
    return {
      start: startOfMonth(current),
      end: endOfMonth(add(current, { months: 11 })),
    }
  }

  return chartWindow
}

export const ProfitAndLossChart = () => {
  const [compactView, setCompactView] = useState(false)
  const barSize = compactView ? 10 : 20

  const { getColor } = useLayerContext()
  const { changeDateRange, dateRange } = useContext(PNL.Context)
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

  const selectionMonth = {
    year: dateRange.startDate.getFullYear(),
    month: dateRange.startDate.getMonth(),
  }
  const { data, loaded, pullData } = useProfitAndLossLTM({
    currentDate: startOfMonth(Date.now()),
  })

  useEffect(() => {
    if (loaded === 'complete' && data) {
      const found = data.find(
        x =>
          Number(startOfMonth(new Date(x.year, x.month - 1, 1))) >=
            Number(dateRange.startDate) &&
          Number(startOfMonth(new Date(x.year, x.month - 1, 1))) <
            Number(dateRange.endDate),
      )

      if (!found) {
        const newDate = startOfMonth(
          new Date(
            dateRange.startDate.getFullYear(),
            startOfMonth(Date.now()).getMonth(),
            1,
          ),
        )
        pullData(newDate)
      }
    }
  }, [dateRange])

  useEffect(() => {
    const newChartWindow = getChartWindow({
      chartWindow,
      currentYear: dateRange.startDate.getFullYear(),
      currentMonth: dateRange.startDate.getMonth(),
    })

    if (
      Number(newChartWindow.start) !== Number(chartWindow.start) &&
      Number(newChartWindow.end) !== Number(chartWindow.end)
    ) {
      setChartWindow(newChartWindow)
    }
  }, [dateRange])

  useEffect(() => {
    if (loaded === 'complete') {
      setTimeout(() => {
        setBarAnimActive(false)
      }, 1000)
    }
  }, [loaded])

  const getMonthName = (pnl: ProfitAndLossSummary | undefined) =>
    pnl
      ? format(new Date(pnl.year, pnl.month - 1, 1), compactView ? 'L' : 'LLL')
      : ''

  const summarizePnL = (pnl: ProfitAndLossSummary | undefined) => ({
    name: getMonthName(pnl),
    revenue: pnl?.income || 0,
    revenueUncategorized: pnl?.uncategorizedInflows || 0,
    expenses: -Math.abs((pnl?.income || 0) - (pnl?.netProfit || 0)),
    expensesUncategorized: -Math.abs(pnl?.uncategorizedOutflows || 0),
    netProfit: pnl?.netProfit || 0,
    selected:
      !!pnl &&
      pnl.month === selectionMonth.month + 1 &&
      pnl.year === selectionMonth.year,
    year: pnl?.year,
    month: pnl?.month,
    base: 0,
    loading: 0,
  })

  const theData = useMemo(() => {
    if (loaded !== 'complete') {
      const loadingData = []
      const today = Date.now()
      for (let i = 0; i <= 11; i++) {
        const currentDate = sub(today, { months: i })
        loadingData.push({
          name: format(currentDate, compactView ? 'L' : 'LLL'),
          revenue: 0,
          revenueUncategorized: 0,
          expenses: 0,
          expensesUncategorized: 0,
          netProfit: 0,
          selected: false,
          year: currentDate.getFullYear(),
          month: currentDate.getMonth() + 1,
          loading: 1,
          base: 0,
        })
      }
      return loadingData
    }
    return data
      ?.filter(x => {
        return (
          Number(startOfMonth(new Date(x.year, x.month, 0))) >=
            Number(chartWindow.start) &&
          Number(endOfMonth(new Date(x.year, x.month, 0))) <=
            Number(chartWindow.end)
        )
      })
      .map(x => summarizePnL(x))
  }, [selectionMonth, chartWindow, loaded, compactView])

  const onClick: CategoricalChartFunc = ({ activePayload }) => {
    if (activePayload && activePayload.length > 0) {
      const { year, month } = activePayload[0].payload
      changeDateRange({
        startDate: new Date(year, month - 1, 1),
        endDate: endOfMonth(new Date(year, month - 1, 1)),
      })
    }
  }

  const CustomTooltip = ({ active, payload }: TooltipProps<number, string>) => {
    if (active && payload && payload.length) {
      const netProfit = payload[0].payload.netProfit ?? 0
      const netProfitClass =
        netProfit > 0 ? 'positive' : netProfit < 0 ? 'negative' : ''

      return (
        <div className='Layer__chart__tooltip'>
          {loaded !== 'complete' ? (
            <Text>Loading...</Text>
          ) : (
            <ul className='Layer__chart__tooltip-list'>
              <li>
                <label className='Layer__chart__tooltip-label'>
                  {capitalizeFirstLetter(payload[1].name ?? '')}
                </label>
                <span className='Layer__chart__tooltip-value'>
                  ${centsToDollars(Math.abs(payload[1].value ?? 0))}
                </span>
              </li>
              <li>
                <label className='Layer__chart__tooltip-label'>
                  {capitalizeFirstLetter(payload[3].name ?? '')}
                </label>
                <span className='Layer__chart__tooltip-value'>
                  ${centsToDollars(Math.abs(payload[3].value ?? 0))}
                </span>
              </li>
              <li>
                <label className='Layer__chart__tooltip-label'>
                  Net Profit
                </label>
                <span
                  className={`Layer__chart__tooltip-value ${netProfitClass}`}
                >
                  ${centsToDollars(netProfit)}
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
      } else if (Math.abs(base) >= 1000000) {
        suffix = 'M'
        val = base / 1000000
      } else if (Math.abs(base) >= 1000) {
        suffix = 'k'
        val = base / 1000
      }
      return `${val}${suffix}`
    } catch (_err) {
      return value
    }
  }

  const CustomizedYTick = (props: any) => {
    return (
      <text {...props} className='Layer__chart_y-axis-tick'>
        <tspan dy='0.355em'>{formatYAxisValue(props.payload.value)}</tspan>
      </text>
    )
  }

  const CustomizedCursor = (props: any) => {
    const { points } = props
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
    <ResponsiveContainer
      className={classNames(
        'Layer__chart-container',
        loaded !== 'complete' && 'Layer__chart-container--loading',
      )}
      width='100%'
      height='100%'
      onResize={width => {
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
        <YAxis tick={<CustomizedYTick />} />
        <Bar
          dataKey='loading'
          barSize={barSize}
          isAnimationActive={barAnimActive}
          animationDuration={100}
          radius={[2, 2, 0, 0]}
          className='Layer__profit-and-loss-chart__bar--loading'
          xAxisId='revenue'
          stackId='revenue'
        />
        <Bar
          dataKey='revenue'
          barSize={barSize}
          isAnimationActive={barAnimActive}
          animationDuration={100}
          radius={[2, 2, 0, 0]}
          className='Layer__profit-and-loss-chart__bar--income'
          xAxisId='revenue'
          stackId='revenue'
        >
          <LabelList
            content={
              <Indicator
                setCustomCursorSize={(width, height, x) =>
                  setCustomCursorSize({ width, height, x })
                }
                customCursorSize={customCursorSize}
                animateFrom={animateFrom}
                setAnimateFrom={setAnimateFrom}
              />
            }
          />
          {theData?.map(entry => {
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
          dataKey='revenueUncategorized'
          barSize={barSize}
          isAnimationActive={barAnimActive}
          animationDuration={100}
          radius={[2, 2, 0, 0]}
          className='Layer__profit-and-loss-chart__bar--income-uncategorized'
          xAxisId='revenue'
          stackId='revenue'
        />
        <Bar
          dataKey='expenses'
          barSize={barSize}
          isAnimationActive={barAnimActive}
          animationDuration={100}
          radius={[2, 2, 0, 0]}
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
        />
        <Line
          dot={true}
          strokeWidth={1}
          strokeLinecap='round'
          type='monotone'
          dataKey='netProfit'
          stroke={getColor(1000)?.hex ?? '#000'}
          name='Net profit'
          xAxisId='revenue'
          animationDuration={20}
        />
        <ReferenceLine
          y={0}
          stroke={getColor(300)?.hex ?? '#EBEDF0'}
          xAxisId='revenue'
        />
      </ComposedChart>
    </ResponsiveContainer>
  )
}
