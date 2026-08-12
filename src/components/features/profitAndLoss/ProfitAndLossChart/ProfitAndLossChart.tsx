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

import { type ProfitAndLossChartConfig } from '@internal-types/features/profitAndLoss/profitAndLossChartConfig'
import { LayerEventComponent, LayerEventType } from '@schemas/common/layerEvents'
import { isDateAllowedToBrowse } from '@utils/features/business/business'
import { areChartWindowsEqual, getChartWindow } from '@utils/features/profitAndLoss/chartWindow'
import { useGlobalDate, useGlobalDateRangeActions } from '@providers/global/GlobalDateStore/GlobalDateStoreProvider'
import { useLayerContext } from '@providers/global/LayerContext/LayerContext'
import { useEmitLayerEvent } from '@hooks/utils/events/useEmitLayerEvent'
import { useIntlFormatter } from '@hooks/utils/i18n/useIntlFormatter'
import { useBankAccountsContext } from '@providers/features/bankAccounts/BankAccountsContext/BankAccountsContext'
import { useBusinessActivationDate } from '@hooks/features/business/useBusinessActivationDate'
import { useProfitAndLossLTM } from '@hooks/features/profitAndLoss/useProfitAndLossLTM'
import { ChartYAxis } from '@ui/Chart/ChartYAxis'
import { ProfitAndLossChartBar } from '@features/profitAndLoss/ProfitAndLossChart/ProfitAndLossChartBar'
import { PROFIT_AND_LOSS_BAR_CONFIG } from '@features/profitAndLoss/ProfitAndLossChart/profitAndLossChartBarConfig'
import { ProfitAndLossChartLegend } from '@features/profitAndLoss/ProfitAndLossChart/ProfitAndLossChartLegend'
import { ProfitAndLossChartPatternDefs } from '@features/profitAndLoss/ProfitAndLossChart/ProfitAndLossChartPatternDefs'
import { ProfitAndLossChartStateCard } from '@features/profitAndLoss/ProfitAndLossChart/ProfitAndLossChartStateCard'
import { ProfitAndLossChartTooltip } from '@features/profitAndLoss/ProfitAndLossChart/ProfitAndLossChartTooltip'
import { transformPnLData } from '@features/profitAndLoss/ProfitAndLossChart/transformPnLData'

import './profitAndLossChart.scss'

export interface ProfitAndLossChartProps {
  tagFilter?: {
    key: string
    values: string[]
  }
  hideLegend?: boolean
  chartConfig?: ProfitAndLossChartConfig
}

const CHART_MARGINS = { left: 12, right: 12, bottom: 12, top: 24 }

const DEFAULT_BAR_SIZE = 20
const DEFAULT_COMPACT_BAR_SIZE = 10

export const ProfitAndLossChart = ({
  tagFilter,
  hideLegend = false,
  chartConfig,
}: ProfitAndLossChartProps) => {
  const { formatMonthName } = useIntlFormatter()
  const [compactView, setCompactView] = useState(false)
  const { barSize: configuredBarSize, compactBarSize: configuredCompactBarSize } = chartConfig?.trendChart ?? {}

  const fullBarSize = configuredBarSize ?? DEFAULT_BAR_SIZE
  const compactBarSize = configuredCompactBarSize
    ?? (configuredBarSize === undefined ? DEFAULT_COMPACT_BAR_SIZE : Math.round(configuredBarSize / 2))

  const barSize = compactView ? compactBarSize : fullBarSize
  const cursorWidth = barSize * 2.2

  const { getColor, business } = useLayerContext()
  const activationDate = useBusinessActivationDate()

  const { date } = useGlobalDate({ dateSelectionMode: 'month' })
  const { setMonth } = useGlobalDateRangeActions()
  const emitLayerEvent = useEmitLayerEvent(LayerEventComponent.ProfitAndLossChart)

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

  const { isSyncing } = useBankAccountsContext()

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
      formatMonthName,
    }),
    [compactView, data, formatMonthName],
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
      emitLayerEvent({
        type: LayerEventType.ProfitAndLossMonthSelected,
        version: 1,
        payload: { year: selectedDate.getFullYear(), month: selectedDate.getMonth() + 1 },
      })
      setMonth({ startDate: selectedDate })
    }

    const newChartWindow = getChartWindow({ chartWindow, selectedDate, activationDate })
    if (!areChartWindowsEqual(chartWindow, newChartWindow)) {
      setChartWindow(newChartWindow)
      setBarAnimation(true)
      prevChartWindowRef.current = newChartWindow
    }
  }, [chartWindow, setMonth, business, activationDate, emitLayerEvent])

  const onResize = useCallback((width: number | undefined) => {
    if (width && width < 620 && !compactView) {
      setCompactView(true)
    }

    if (width && width >= 620 && compactView) {
      setCompactView(false)
    }
  }, [compactView])

  return (
    <div className='Layer__ProfitAndLossChart'>
      <ResponsiveContainer
        key='pnl-chart'
        className='Layer__ProfitAndLossChart__Container'
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
            stroke={getColor(200)?.hex ?? 'var(--color-base-0)'}
            strokeDasharray='5 5'
          />
          {!hideLegend && <ProfitAndLossChartLegend />}
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
            dot={{
              fill: 'var(--color-base-0)',
              stroke: 'var(--color-base-1000)',
            }}
            type='linear'
            dataKey='netProfit'
            stroke='var(--pnl-chart-line-color, var(--color-base-1000))'
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
