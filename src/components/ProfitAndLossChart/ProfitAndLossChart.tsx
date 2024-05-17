import React, { useContext, useEffect, useMemo, useState } from 'react'
import { useLayerContext } from '../../hooks/useLayerContext'
import { useProfitAndLossLTM } from '../../hooks/useProfitAndLoss/useProfitAndLossLTM'
import { centsToDollars } from '../../models/Money'
import { ProfitAndLoss } from '../../types'
import { capitalizeFirstLetter } from '../../utils/format'
import { ProfitAndLoss as PNL } from '../ProfitAndLoss'
import { Text } from '../Typography'
import { Indicator } from './Indicator'
import classNames from 'classnames'
import { format, parseISO, startOfMonth } from 'date-fns'
import {
  BarChart,
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
} from 'recharts'
import { CategoricalChartFunc } from 'recharts/types/chart/generateCategoricalChart'

// const barGap = 4
const barSize = 10

export const ProfitAndLossChart = () => {
  const { getColor } = useLayerContext()
  const { changeDateRange, dateRange } = useContext(PNL.Context)
  const [customCursorSize, setCustomCursorSize] = useState({
    width: 0,
    height: 0,
    x: 0,
  })
  const [barAnimActive, setBarAnimActive] = useState(true)

  const startSelectionMonth = dateRange.startDate.getMonth()
  const endSelectionMonth = dateRange.endDate.getMonth()

  const { data, loaded } = useProfitAndLossLTM({
    currentDate: startOfMonth(Date.now()),
  })

  useEffect(() => {
    if (loaded === 'complete') {
      setTimeout(() => {
        setBarAnimActive(false)
      }, 1000)
    }
  }, [loaded])

  const getMonthName = (pnl: ProfitAndLoss | undefined) =>
    pnl ? format(parseISO(pnl.start_date), 'LLL') : ''

  const summarizePnL = (pnl: ProfitAndLoss | undefined) => {
    console.log('pnl', pnl)
    return {
      name: getMonthName(pnl),
      revenue: pnl?.income.value || 0,
      revenueUncategorized: (pnl?.income.value || 0) / 2, // @TODO - replace with actual value
      expenses: -Math.abs((pnl?.income.value || 0) - (pnl?.net_profit || 0)),
      expensesUncategorized:
        -Math.abs((pnl?.income.value || 0) - (pnl?.net_profit || 0)) / 2, // @TODO - replace with actual value
      netProfit: pnl?.net_profit || 0,
      selected:
        !!pnl &&
        parseISO(pnl.start_date).getMonth() >= startSelectionMonth &&
        parseISO(pnl.end_date).getMonth() <= endSelectionMonth,
    }
  }

  const theData = useMemo(() => {
    if (loaded !== 'complete') {
      return data?.map(x => ({
        name: format(x.startDate, 'LLL'),
        revenue: 1,
        revenueUncategorized: 0,
        expenses: 1,
        expensesUncategorized: 0,
        netProfit: 0,
        selected: false,
      }))
    }
    return data?.map(x => summarizePnL(x.data))
  }, [startSelectionMonth, endSelectionMonth, loaded])

  const onClick: CategoricalChartFunc = ({ activeTooltipIndex }) => {
    const index =
      activeTooltipIndex !== undefined && activeTooltipIndex > -1
        ? activeTooltipIndex
        : -1
    const selection = data[index]
    if (selection && selection.data) {
      const { start_date, end_date } = selection.data
      changeDateRange({
        startDate: parseISO(start_date),
        endDate: parseISO(end_date),
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
                  {capitalizeFirstLetter(payload[0].name ?? '')}
                </label>
                <span className='Layer__chart__tooltip-value'>
                  ${centsToDollars(Math.abs(payload[0].value ?? 0))}
                </span>
              </li>
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
                  {capitalizeFirstLetter(payload[2].name ?? '')}
                </label>
                <span className='Layer__chart__tooltip-value'>
                  ${centsToDollars(Math.abs(payload[2].value ?? 0))}
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
      return (Number(value) / 100).toLocaleString('en-US', {
        style: 'currency',
        currency: 'USD',
      })
    } catch (_err) {
      return value
    }
  }

  const CustomizedYTick = (props: any) => {
    // return <text orientation="left" width="60" height="140.34375" stroke="none" x="64" y="21.65625" class="recharts-text recharts-cartesian-axis-tick-value" text-anchor="end" fill="#666"><tspan x="64" dy="0.355em">2100000</tspan></text>

    return (
      <text {...props} className='Layer__chart_y-axis-tick'>
        <tspan dy='0.355em'>{formatYAxisValue(props.payload.value)}</tspan>
      </text>
    )
  }

  const CustomizedCursor = (props: any) => {
    const { x, y, width: rectWidth, points } = props
    const { width, height } = customCursorSize
    const offsetX = (rectWidth - width) / 2

    console.log('curosr', props, width, height, offsetX, x, y)

    return (
      <Rectangle
        fill={'#F7F8FA'}
        stroke='none'
        x={points[0].x - width / 2}
        y={points[0].y}
        width={width + 1}
        height={height}
        radius={6}
        className='Layer__chart__tooltip-cursor'
      />
    )

    // return (
    //   <Rectangle
    //     fill={'#F7F8FA'}
    //     stroke='none'
    //     x={x + offsetX}
    //     y={y}
    //     width={width}
    //     height={height}
    //     radius={6}
    //     className='Layer__chart__tooltip-cursor'
    //   />
    // )
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
        <YAxis
          tick={<CustomizedYTick />}
          domain={([dataMin, dataMax]) => {
            // @TODO calculate min and max as roundings to 10k (or if less than 10k then to full 5k or 1k)
            return [-3000000, 3000000]
          }}
        />
        <Bar
          dataKey='revenue'
          barSize={barSize}
          isAnimationActive={barAnimActive}
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
          radius={[2, 2, 0, 0]}
          className='Layer__profit-and-loss-chart__bar--income-uncategorized'
          xAxisId='revenue'
          stackId='revenue'
        />
        <Bar
          dataKey='expenses'
          barSize={barSize}
          isAnimationActive={barAnimActive}
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
        />
      </ComposedChart>
    </ResponsiveContainer>
  )
}
