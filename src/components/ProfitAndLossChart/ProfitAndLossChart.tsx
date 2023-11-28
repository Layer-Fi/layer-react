import React, { useContext, useMemo } from 'react'
import { useProfitAndLoss } from '../../hooks/useProfitAndLoss'
import { ProfitAndLoss } from '../../types'
import { ProfitAndLoss as PNL } from '../ProfitAndLoss'
import {
  endOfMonth,
  format,
  parse,
  parseISO,
  startOfMonth,
  sub,
} from 'date-fns'
import { BarChart, XAxis, Tooltip, Cell, Bar } from 'recharts'
import { CategoricalChartFunc } from 'recharts/types/chart/generateCategoricalChart'

export const ProfitAndLossChart = () => {
  const { changeDateRange, dateRange, dimensions } = useContext(PNL.Context)
  const thisMonth = startOfMonth(Date.now())

  const startSelectionMonth = dateRange.startDate.getMonth()
  const endSelectionMonth = dateRange.endDate.getMonth()

  // Yes, this looks weird, but we have to load all the data from the
  // last 12 months as we don't have a single endpoint yet. And we
  // can't use hooks in a loop.
  const monthData: (ProfitAndLoss | undefined)[] = []
  monthData.push(
    useProfitAndLoss({
      startDate: startOfMonth(sub(thisMonth, { months: 11 })),
      endDate: endOfMonth(sub(thisMonth, { months: 11 })),
    })?.data,
  )
  monthData.push(
    useProfitAndLoss({
      startDate: startOfMonth(sub(thisMonth, { months: 10 })),
      endDate: endOfMonth(sub(thisMonth, { months: 10 })),
    })?.data,
  )
  monthData.push(
    useProfitAndLoss({
      startDate: startOfMonth(sub(thisMonth, { months: 9 })),
      endDate: endOfMonth(sub(thisMonth, { months: 9 })),
    })?.data,
  )
  monthData.push(
    useProfitAndLoss({
      startDate: startOfMonth(sub(thisMonth, { months: 8 })),
      endDate: endOfMonth(sub(thisMonth, { months: 8 })),
    })?.data,
  )
  monthData.push(
    useProfitAndLoss({
      startDate: startOfMonth(sub(thisMonth, { months: 7 })),
      endDate: endOfMonth(sub(thisMonth, { months: 7 })),
    })?.data,
  )
  monthData.push(
    useProfitAndLoss({
      startDate: startOfMonth(sub(thisMonth, { months: 6 })),
      endDate: endOfMonth(sub(thisMonth, { months: 6 })),
    })?.data,
  )
  monthData.push(
    useProfitAndLoss({
      startDate: startOfMonth(sub(thisMonth, { months: 5 })),
      endDate: endOfMonth(sub(thisMonth, { months: 5 })),
    })?.data,
  )
  monthData.push(
    useProfitAndLoss({
      startDate: startOfMonth(sub(thisMonth, { months: 4 })),
      endDate: endOfMonth(sub(thisMonth, { months: 4 })),
    })?.data,
  )
  monthData.push(
    useProfitAndLoss({
      startDate: startOfMonth(sub(thisMonth, { months: 3 })),
      endDate: endOfMonth(sub(thisMonth, { months: 3 })),
    })?.data,
  )
  monthData.push(
    useProfitAndLoss({
      startDate: startOfMonth(sub(thisMonth, { months: 2 })),
      endDate: endOfMonth(sub(thisMonth, { months: 2 })),
    })?.data,
  )
  monthData.push(
    useProfitAndLoss({
      startDate: startOfMonth(sub(thisMonth, { months: 1 })),
      endDate: endOfMonth(sub(thisMonth, { months: 1 })),
    })?.data,
  )
  monthData.push(
    useProfitAndLoss({
      startDate: thisMonth,
      endDate: endOfMonth(thisMonth),
    })?.data,
  )

  const getMonthName = (pnl: ProfitAndLoss | undefined) =>
    !!pnl ? format(parseISO(pnl.start_date), 'LLL') : ''

  const summarizePnL = (pnl: ProfitAndLoss | undefined) => ({
    name: getMonthName(pnl),
    revenue: pnl?.income.value || 0,
    expenses: (pnl?.income.value || 0) - (pnl?.net_profit || 0),
    selected:
      !!pnl &&
      parseISO(pnl.start_date).getMonth() >= startSelectionMonth &&
      parseISO(pnl.end_date).getMonth() <= endSelectionMonth,
  })

  const onClick: CategoricalChartFunc = ({ activeTooltipIndex }) => {
    const selection = monthData[activeTooltipIndex || -1]
    if (selection) {
      const { start_date: startDate, end_date: endDate } = selection
      changeDateRange({
        startDate: parseISO(startDate),
        endDate: parseISO(endDate),
      })
    }
  }

  // If net profit doesn't change, we're probably still the same.
  const data = useMemo(
    () => monthData.map(summarizePnL),
    monthData.map(m => m?.net_profit),
  )

  return (
    <BarChart
      width={dimensions?.width}
      height={250}
      data={data}
      onClick={onClick}
      className="Layer__profit-and-loss-chart"
    >
      <XAxis dataKey="name" tickLine={false} />
      <Bar
        dataKey="revenue"
        barSize={16}
        className="Layer__profit-and-loss-chart__bar--income"
      >
        {data.map(entry => (
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
        dataKey="expenses"
        barSize={16}
        className="Layer__profit-and-loss-chart__bar--expenses"
      >
        {data.map((entry, index) => (
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
  )
}
