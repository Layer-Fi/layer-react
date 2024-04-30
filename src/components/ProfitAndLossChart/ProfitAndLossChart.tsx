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
} from 'recharts'
import { CategoricalChartFunc } from 'recharts/types/chart/generateCategoricalChart'

const barGap = 4
const barSize = 20

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

  // Yes, this looks weird, but we have to load all the data from the
  // last 12 months as we don't have a single endpoint yet. And we
  // can't use hooks in a loop.
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

  const summarizePnL = (pnl: ProfitAndLoss | undefined) => ({
    name: getMonthName(pnl),
    revenue: pnl?.income.value || 0,
    expenses: Math.abs((pnl?.income.value || 0) - (pnl?.net_profit || 0)),
    netProfit: pnl?.net_profit || 0,
    selected:
      !!pnl &&
      parseISO(pnl.start_date).getMonth() >= startSelectionMonth &&
      parseISO(pnl.end_date).getMonth() <= endSelectionMonth,
  })

  const onClick: CategoricalChartFunc = ({ activeTooltipIndex }) => {
    const selection = data[activeTooltipIndex || -1]
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

  const CustomizedCursor = (props: any) => {
    const { x, y } = props
    const { width, height } = customCursorSize
    const offsetX = width * 0.1

    return (
      <Rectangle
        fill={'#F7F8FA'}
        stroke='none'
        x={x + offsetX}
        y={y}
        width={width}
        height={height}
        radius={6}
        className='Layer__chart__tooltip-cursor'
      />
    )
  }

  // If net profit doesn't change, we're probably still the same.
  const theData = useMemo(() => {
    if (loaded !== 'complete') {
      return data?.map(x => ({
        name: format(x.startDate, 'LLL'),
        revenue: 1,
        expenses: 1,
        netProfit: 0,
        selected: false,
      }))
    }
    return data?.map(x => summarizePnL(x.data))
  }, [startSelectionMonth, endSelectionMonth, loaded])

  const [animateFrom, setAnimateFrom] = useState(-1)

  return (
    <ResponsiveContainer
      className={classNames(
        'Layer__chart-container',
        loaded !== 'complete' && 'Layer__chart-container--loading',
      )}
      width='100%'
      height='100%'
      minHeight={200}
    >
      <BarChart
        margin={{ left: 12, right: 12, bottom: 12 }}
        data={theData}
        onClick={onClick}
        barGap={barGap}
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
          verticalAlign='bottom'
          align='left'
          wrapperStyle={{ bottom: 0 }}
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
          ]}
        />
        <XAxis dataKey='name' tickLine={false} />
        <Bar
          dataKey='revenue'
          barSize={barSize}
          isAnimationActive={barAnimActive}
          radius={[2, 2, 0, 0]}
          className='Layer__profit-and-loss-chart__bar--income'
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
          dataKey='expenses'
          barSize={barSize}
          isAnimationActive={barAnimActive}
          radius={[2, 2, 0, 0]}
          className='Layer__profit-and-loss-chart__bar--expenses'
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
      </BarChart>
    </ResponsiveContainer>
  )
}
