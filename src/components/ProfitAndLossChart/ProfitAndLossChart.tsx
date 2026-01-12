import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  addMonths,
  endOfMonth,
  startOfMonth,
  sub,
} from 'date-fns'
import {
  CartesianGrid,
  ComposedChart,
  DefaultZIndexes,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  type TooltipIndex,
  XAxis,
} from 'recharts'

import { isDateAllowedToBrowse } from '@utils/business'
import { useBusinessActivationDate } from '@hooks/business/useBusinessActivationDate'
import { useLinkedAccounts } from '@hooks/useLinkedAccounts/useLinkedAccounts'
import { useProfitAndLossLTM } from '@hooks/useProfitAndLoss/useProfitAndLossLTM'
import { useGlobalDate, useGlobalDateRangeActions } from '@providers/GlobalDateStore/GlobalDateStoreProvider'
import { useLayerContext } from '@contexts/LayerContext/LayerContext'
import { ChartYAxis } from '@components/Chart/ChartYAxis'
import { areChartWindowsEqual, getChartWindow } from '@components/ProfitAndLossChart/getChartWindow'
import { ProfitAndLossChartBar } from '@components/ProfitAndLossChart/ProfitAndLossChartBar'
import { PROFIT_AND_LOSS_BAR_CONFIG } from '@components/ProfitAndLossChart/profitAndLossChartBarConfig'
import { ProfitAndLossChartLegend } from '@components/ProfitAndLossChart/ProfitAndLossChartLegend'
import { ProfitAndLossChartPatternDefs } from '@components/ProfitAndLossChart/ProfitAndLossChartPatternDefs'
import { ProfitAndLossChartStateCard } from '@components/ProfitAndLossChart/ProfitAndLossChartStateCard'
import { ProfitAndLossChartTooltip } from '@components/ProfitAndLossChart/ProfitAndLossChartTooltip'
import { transformPnLData } from '@components/ProfitAndLossChart/transformPnLData'

export interface ProfitAndLossChartProps {
  tagFilter?: {
    key: string
    values: string[]
  }
}

const CHART_MARGINS = { left: 12, right: 12, bottom: 12 }

export const ProfitAndLossChart = ({ tagFilter }: ProfitAndLossChartProps) => {
  const [compactView, setCompactView] = useState(false)
  const barSize = compactView ? 10 : 20
  const cursorWidth = barSize * 2.2

  const { getColor, business } = useLayerContext()
  const activationDate = useBusinessActivationDate()

  const { date } = useGlobalDate({ dateSelectionMode: 'month' })
  const { setMonth } = useGlobalDateRangeActions()

  const [chartWindow, setChartWindow] = useState({
    start: startOfMonth(sub(date, { months: 11 })),
    end: endOfMonth(date),
  })

  const [barAnimation, setBarAnimation] = useState(false)
  const prevChartWindowRef = useRef(chartWindow)

  const { data } = useProfitAndLossLTM({
    tagFilter,
    chartWindow,
  })

  const { data: linkedAccounts } = useLinkedAccounts()

  const isSyncing = useMemo(
    () => Boolean(linkedAccounts?.some(item => item.is_syncing)),
    [linkedAccounts],
  )

  useEffect(() => {
    if (!activationDate) return

    const prev = prevChartWindowRef.current
    const next = getChartWindow({ chartWindow: prev, selectedDate: date, activationDate })
    if (!areChartWindowsEqual(prev, next)) {
      setBarAnimation(true)
      setChartWindow(next)
      prevChartWindowRef.current = next
    }
  }, [activationDate, date])

  useEffect(() => {
    if (!barAnimation) return
    const timeout = setTimeout(() => setBarAnimation(false), 200)
    return () => clearTimeout(timeout)
  }, [barAnimation])

  const dataOrPlaceholderData = useMemo(
    () => transformPnLData({
      data,
      compactView,
    }),
    [data, compactView],
  )

  const selectedIndex = dataOrPlaceholderData.findIndex(
    item => item.year === date.getFullYear() && item.month === date.getMonth() + 1,
  )

  const onClick = useCallback(({ activeIndex }: { activeIndex: number | TooltipIndex | undefined }) => {
    if (activeIndex === undefined || activeIndex === null || !activationDate) {
      return
    }

    const selectedDate = addMonths(chartWindow.start, Number(activeIndex))
    const isMonthAllowed = isDateAllowedToBrowse(selectedDate, business)

    if (isMonthAllowed) {
      setMonth({ startDate: selectedDate })
    }

    const newChartWindow = getChartWindow({ chartWindow, selectedDate, activationDate })
    if (!areChartWindowsEqual(chartWindow, newChartWindow)) {
      setChartWindow(newChartWindow)
      setBarAnimation(true)
      prevChartWindowRef.current = newChartWindow
    }
  }, [chartWindow, setMonth, business, activationDate])

  const onResize = useCallback((width: number | undefined) => {
    if (width && width < 620 && !compactView) {
      setCompactView(true)
    }

    if (width && width >= 620 && compactView) {
      setCompactView(false)
    }
  }, [compactView])

  return (
    <div className='Layer__chart-wrapper'>
      <ResponsiveContainer
        key='pnl-chart'
        className='Layer__chart-container'
        width='100%'
        height='100%'
        onResize={onResize}
        debounce={50}
      >
        <ComposedChart
          margin={CHART_MARGINS}
          data={dataOrPlaceholderData}
          onClick={onClick}
          className='Layer__profit-and-loss-chart'
        >
          <ProfitAndLossChartPatternDefs />
          <ReferenceLine y={0} stroke={getColor(300)?.hex ?? '#EBEDF0'} xAxisId='revenue' zIndex={DefaultZIndexes.bar - 1} />
          <ProfitAndLossChartTooltip cursorWidth={cursorWidth} />
          <CartesianGrid
            vertical={false}
            stroke={getColor(200)?.hex ?? '#fff'}
            strokeDasharray='5 5'
          />
          <ProfitAndLossChartLegend />
          <XAxis dataKey='name' xAxisId='revenue' tickLine={false} />
          <XAxis dataKey='name' xAxisId='expenses' tickLine={false} height={0} hide />
          <ChartYAxis />
          {PROFIT_AND_LOSS_BAR_CONFIG.map(config => (
            <ProfitAndLossChartBar
              key={config.dataKey}
              barSize={barSize}
              selectedIndex={selectedIndex}
              barAnimation={barAnimation}
              {...config}
            />
          ))}
          <Line
            dot
            strokeWidth={1}
            type='linear'
            dataKey='netProfit'
            stroke={getColor(1000)?.hex ?? '#000'}
            name='Net profit'
            xAxisId='revenue'
            animationDuration={200}
          />
        </ComposedChart>
      </ResponsiveContainer>
      {isSyncing ? <ProfitAndLossChartStateCard /> : null}
    </div>
  )
}
