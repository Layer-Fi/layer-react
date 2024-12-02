import React, { useContext, useEffect, useMemo, useState, type FunctionComponent } from 'react'
import { useLayerContext } from '../../contexts/LayerContext'
import { useLinkedAccounts } from '../../hooks/useLinkedAccounts'
import {
  useProfitAndLossLTM,
} from '../../hooks/useProfitAndLoss/useProfitAndLossLTM'
import { centsToDollars } from '../../models/Money'
import { isDateAllowedToBrowse } from '../../utils/business'
import { ProfitAndLoss as PNL } from '../ProfitAndLoss'
import { Heading, HeadingSize, Text } from '../Typography'
import { ChartStateCard } from './ChartStateCard'
import { Indicator } from './Indicator'
import classNames from 'classnames'
import {
  endOfMonth,
  startOfMonth,
  sub,
} from 'date-fns'
import {
  XAxis,
  Cell,
  Bar,
  LabelList,
  CartesianGrid,
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
import { collectData, formatYAxisValue, getBarSizing, getChartWindow, getLoadingValue, hasAnyData } from './utils'
import { Header, HeaderCol, HeaderRow } from '../Header'

export type ViewSize = 'xs' | 'md' | 'lg'

export interface Props {
  title?: string
  withDatePicker?: boolean
  enablePeriods?: boolean
  forceRerenderOnDataChange?: boolean
  tagFilter?: {
    key: string
    values: string[]
  }
}

export const ProfitAndLossChart = ({
  title,
  withDatePicker = false,
  enablePeriods,
  forceRerenderOnDataChange = false,
  tagFilter = undefined,
}: Props) => {
  const { getColor, business } = useLayerContext()
  const { changeDateRange, dateRange, period } = useContext(PNL.Context)
  const { data: linkedAccounts } = useLinkedAccounts()

  const { data, loaded, pullData } = useProfitAndLossLTM({
    currentDate: startOfMonth(Date.now()),
    tagFilter: tagFilter,
    period,
  })

  const [viewSize, setViewSize] = useState<ViewSize>('lg')
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
  const [animateFrom, setAnimateFrom] = useState(-1)

  const selectionMonth = useMemo(
    () => ({
      year: localDateRange.startDate.getFullYear(),
      month: localDateRange.startDate.getMonth(),
    }),
    [localDateRange],
  )

  const anyData = useMemo(() => hasAnyData(data), [data])

  const isSyncing = useMemo(
    () => Boolean(linkedAccounts?.some(item => item.is_syncing)),
    [linkedAccounts],
  )

  const loadingValue = useMemo(() => getLoadingValue(data), [data])

  useEffect(() => {
    if (
      Number(dateRange.startDate) !== Number(localDateRange.startDate)
      || Number(dateRange.endDate) !== Number(localDateRange.endDate)
    ) {
      setLocalDateRange(dateRange)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateRange])

  useEffect(() => {
    if (loaded === 'complete' && data) {
      const foundCurrent = data.find(
        x =>
          Number(startOfMonth(new Date(x.year, x.month - 1, 1)))
            >= Number(localDateRange.startDate)
          && Number(startOfMonth(new Date(x.year, x.month - 1, 1)))
            < Number(localDateRange.endDate),
      )

      if (!foundCurrent && theData?.length > 1) {
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

      if (!foundBefore && theData?.length > 1) {
        const newDate = startOfMonth(
          sub(localDateRange.startDate, { months: 1 }),
        )
        pullData(newDate)
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localDateRange])

  useEffect(() => {
    if (loaded === 'complete') {
      setTimeout(() => {
        setBarAnimActive(false)
      }, 2000)
    }
  }, [loaded])

  /** @TODO temp */
  const len = period === 'year' ? 1 : period === 'quarter' ? 4 : 12
  const theData = useMemo(() => collectData({
    data,
    loaded,
    loadingValue,
    anyData,
    chartWindow,
    viewSize,
    selectionMonth,
  }).slice(0, len),
  [data, loaded, loadingValue, anyData, chartWindow, viewSize, selectionMonth, len]
  )
  // @TODO - Tom
  // }), [selectionMonth, chartWindow, data, loaded, viewSize])

  const onClick: CategoricalChartFunc = ({ activePayload }) => {
    if (loaded !== 'complete' || !anyData) {
      return
    }

    if (activePayload && activePayload.length > 0) {
      const { year, month } = activePayload[0].payload
      const isMonthAllowed = isDateAllowedToBrowse(
        new Date(year, month - 1, 1),
        business,
      )

      if (isMonthAllowed) {
        changeDateRange({
          startDate: new Date(year, month - 1, 1),
          endDate: endOfMonth(new Date(year, month - 1, 1)),
        })
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
          {loaded !== 'complete' ? (
            <Text>Loading...</Text>
          ) : !anyData ? (
            <Text>No data yet</Text>
          ) : (
            <ul className='Layer__chart__tooltip-list'>
              <li>
                <label className='Layer__chart__tooltip-label'>Revenue</label>
                <span className='Layer__chart__tooltip-value'>
                  ${centsToDollars(revenue)}
                </span>
              </li>
              <li>
                <label className='Layer__chart__tooltip-label'>Expenses</label>
                <span className='Layer__chart__tooltip-value'>
                  ${centsToDollars(Math.abs(expenses))}
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
    { points }: { points: [{ x: number, y: number }] }
  ) => {
    const { width, height } = customCursorSize

    return (
      <Rectangle
        fill='#F7F8FA'
        stroke='none'
        x={points[0].x - width / 2}
        y={points[0].y - 12}
        width={width}
        height={height}
        radius={6}
        className='Layer__chart__tooltip-cursor'
      />
    )
  }

  const [barSize, barMargin] = useMemo(() => 
    getBarSizing((theData ?? []).length, viewSize),
  [viewSize, theData]
  )

  return (
    <div className={classNames('Layer__chart-wrapper Layer__profit-and-loss__chart', !title && !withDatePicker ? 'Layer__profit-and-loss__chart--with-floating-legend' : undefined)}>
      {title || withDatePicker ? (
        <Header className={classNames('Layer__profit-and-loss__chart-header', withDatePicker && enablePeriods ? 'Layer__profit-and-loss__chart-header--with-date-picker-extended' : withDatePicker ? 'Layer__profit-and-loss__chart-header--with-date-picker' : 'Layer__profit-and-loss__chart-header--no-date-picker')}>
          <HeaderRow>
            <HeaderCol>
              <Heading size={HeadingSize.view}>{title}</Heading>
            </HeaderCol>
            {!withDatePicker && (
              <HeaderCol>
                <PNL.ChartLegend />
              </HeaderCol>
            )}
          </HeaderRow>
          {withDatePicker && (
            <>
              <HeaderRow>
                <HeaderCol>
                  <PNL.DatePicker enablePeriods={enablePeriods} />
                </HeaderCol>
                <HeaderCol className='Layer__profit-and-loss__chart-header__legend-col'>
                  <PNL.ChartLegend />
                </HeaderCol>
              </HeaderRow>
              <HeaderRow className='Layer__profit-and-loss__chart-header__legend-row'>
                <HeaderCol>
                  <PNL.ChartLegend />
                </HeaderCol>
              </HeaderRow>
            </>
          )}
        </Header>
      ) : (
        <div className='Layer__profit-and-loss__chart__floating-legend'>
          <PNL.ChartLegend />
        </div>
      )}
      <ResponsiveContainer
        key={forceRerenderOnDataChange ? JSON.stringify(theData) : 'pnl-chart'}
        className={classNames(
          'Layer__chart-container',
          loaded !== 'complete' && 'Layer__chart-container--loading',
        )}
        width='100%'
        height='100%'
        onResize={width => {
          if (width && width < 500 && viewSize !== 'xs') {
            setViewSize('xs')
            return
          }

          if (width && width >= 500 && width < 680 && viewSize !== 'md') {
            setViewSize('md')
            return
          }

          if (width && width >= 680 && viewSize !== 'lg') {
            setViewSize('lg')
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
          <XAxis dataKey='name' xAxisId='revenue' tickLine={false} />
          <XAxis dataKey='name' xAxisId='expenses' tickLine={false} hide />
          <YAxis tick={CustomizedYTick} width={40}/>
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
            {theData?.map(entry => {
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
              content={
                <Indicator
                  setCustomCursorSize={(width, height, x) =>
                    setCustomCursorSize({ width, height, x })
                  }
                  customCursorSize={customCursorSize}
                  animateFrom={animateFrom}
                  setAnimateFrom={setAnimateFrom}
                  barMargin={barMargin}
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
            dataKey='uncategorizedOutflowsInverse'
            barSize={barSize}
            isAnimationActive={barAnimActive}
            animationDuration={100}
            radius={[2, 2, 0, 0]}
            className='Layer__profit-and-loss-chart__bar--expenses-uncategorized'
            xAxisId='revenue'
            stackId='revenue'
          >
            {theData?.map(entry => {
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
            {theData?.map(entry => {
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
            {theData?.map(entry => {
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
