import { useCallback, useMemo, useState } from 'react'
import { format } from 'date-fns'
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  ResponsiveContainer,
  XAxis,
} from 'recharts'

import { centsToDollars } from '@models/Money'
import { useLayerContext } from '@contexts/LayerContext/LayerContext'
import { VStack } from '@ui/Stack/Stack'
import { ChartYAxis } from '@components/Chart/ChartYAxis'
import type { MileageDeductionChartDataPoint } from '@components/MileageDeductionChart/MileageDeductionChartDataPoint'
import {
  MileageDeductionChartTooltip,
} from '@components/MileageDeductionChart/MileageDeductionChartTooltip'

import './mileageDeductionChart.scss'

interface MileageMonth {
  month: number
  miles: number
  estimatedDeduction: number
}

interface MileageYear {
  year: number
  months: MileageMonth[]
}

interface MileageDeductionChartProps {
  data: {
    years: MileageYear[]
  }
  selectedYear: number
}

const CHART_MARGIN = { top: 0, right: 0, bottom: 0, left: 0 }
const CHART_HEIGHT = 328
const RESIZE_DEBOUNCE_MS = 50
const CURSOR_WIDTH_MULTIPLE = 2.2

const BAR_RADIUS: [number, number, number, number] = [2, 2, 0, 0]
const GRID_STROKE_DASHARRAY = '5 5'
const GRID_STROKE_FALLBACK = '#f0f0f0'
const TICK_FONT_SIZE = 12

const SMALL_BREAKPOINT = 480
const MEDIUM_BREAKPOINT = 720
const SMALL_BAR_SIZE = 10
const MEDIUM_BAR_SIZE = 20
const LARGE_BAR_SIZE = 30

const getBarSize = (width: number | undefined): number => {
  if (!width) return MEDIUM_BAR_SIZE

  if (width < SMALL_BREAKPOINT) return SMALL_BAR_SIZE
  if (width < MEDIUM_BREAKPOINT) return MEDIUM_BAR_SIZE
  return LARGE_BAR_SIZE
}

const formatYAxis = (value?: string | number) =>
  `$${centsToDollars(Number(value))}`

export const MileageDeductionChart = ({
  data,
  selectedYear,
}: MileageDeductionChartProps) => {
  const { getColor } = useLayerContext()
  const [barSize, setBarSize] = useState(MEDIUM_BAR_SIZE)

  const onResize = useCallback((width: number | undefined) => {
    setBarSize(getBarSize(width))
  }, [])

  const chartData = useMemo<MileageDeductionChartDataPoint[]>(() => {
    const yearData = data.years.find(y => y.year === selectedYear)
    if (!yearData) return []

    return Array.from({ length: 12 }, (_, i) => {
      const monthData = yearData.months.find(m => m.month === i + 1)
      return {
        month: i + 1,
        monthName: format(new Date(selectedYear, i, 1), 'MMM'),
        deduction: monthData?.estimatedDeduction || 0,
        miles: monthData?.miles || 0,
      }
    })
  }, [data, selectedYear])

  return (
    <VStack className='Layer__MileageDeductionChart' align='center' justify='center'>
      <ResponsiveContainer
        key='mileage-deduction-chart'
        width='100%'
        height={CHART_HEIGHT}
        debounce={RESIZE_DEBOUNCE_MS}
        onResize={onResize}
      >
        <ComposedChart data={chartData} margin={CHART_MARGIN}>
          <CartesianGrid
            vertical={false}
            stroke={getColor(200)?.hex ?? GRID_STROKE_FALLBACK}
            strokeDasharray={GRID_STROKE_DASHARRAY}
          />

          <ChartYAxis format={formatYAxis} domain={[0, 'auto']} />

          <MileageDeductionChartTooltip
            selectedYear={selectedYear}
            cursorWidth={barSize * CURSOR_WIDTH_MULTIPLE}
          />

          <Bar
            dataKey='deduction'
            barSize={barSize}
            radius={BAR_RADIUS}
            className='Layer__MileageDeductionChart__bar--deduction'
          />

          <XAxis
            dataKey='monthName'
            tickLine={false}
            tick={{ fontSize: TICK_FONT_SIZE }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </VStack>
  )
}
