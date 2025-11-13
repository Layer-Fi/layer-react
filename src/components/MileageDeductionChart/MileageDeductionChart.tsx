import { useMemo, type FunctionComponent } from 'react'
import { format } from 'date-fns'
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  Rectangle,
} from 'recharts'
import { useLayerContext } from '@contexts/LayerContext/LayerContext'
import { centsToDollars } from '@models/Money'
import './mileageDeductionChart.scss'
import { VStack } from '@components/ui/Stack/Stack'

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
  onMonthClick?: (year: number, month: number) => void
}

const CHART_MARGIN = { top: 0, right: 0, bottom: 0, left: 0 }
const BAR_SIZE = 20
const CURSOR_MARGIN = 12

export const MileageDeductionChart = ({
  data,
  selectedYear,
  onMonthClick,
}: MileageDeductionChartProps) => {
  const { getColor } = useLayerContext()

  const chartData = useMemo(() => {
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

  const formatYAxis = (value: number) => {
    return `$${(value / 100).toLocaleString()}`
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.[0]) return null

    const data = payload[0].payload
    return (
      <div className='Layer__chart__tooltip'>
        <div className='Layer__chart__tooltip-list'>
          <li>
            <span className='Layer__chart__tooltip-label'>
              {data.monthName}
              {' '}
              {selectedYear}
            </span>
          </li>
          <li>
            <span className='Layer__chart__tooltip-label'>Miles:</span>
            <span className='Layer__chart__tooltip-value'>
              {data.miles.toLocaleString()}
            </span>
          </li>
          <li>
            <span className='Layer__chart__tooltip-label'>Deduction:</span>
            <span className='Layer__chart__tooltip-value positive'>
              $
              {centsToDollars(data.deduction)}
            </span>
          </li>
        </div>
      </div>
    )
  }

  const CustomizedYTick = ({
    payload,
    ...restProps
  }: {
    payload: { value: number }
  }) => {
    return (
      <text {...restProps} className='Layer__chart_y-axis-tick'>
        <tspan dy='0.355em'>{formatYAxis(payload.value)}</tspan>
      </text>
    )
  }

  const handleBarClick = (data: any) => {
    if (onMonthClick) {
      onMonthClick(selectedYear, data.month)
    }
  }

  const CustomizedCursor: FunctionComponent<any> = ({ points, height }: any) => {
    const boxWidth = BAR_SIZE + (2 * CURSOR_MARGIN)

    return (
      <Rectangle
        fill='#F7F8FA'
        stroke='none'
        x={points[0].x - boxWidth / 2}
        y={CHART_MARGIN.top}
        width={boxWidth}
        height={height || 0}
        radius={6}
        className='Layer__chart__tooltip-cursor'
      />
    )
  }

  return (
    <VStack className='Layer__mileage-chart' align='center' justify='center'>
      <ResponsiveContainer width='100%' height={300}>
        <ComposedChart
          data={chartData}
          margin={CHART_MARGIN}
        >
          <CartesianGrid
            vertical={false}
            stroke={getColor(200)?.hex ?? '#f0f0f0'}
            strokeDasharray='5 5'
          />

          <YAxis
            tick={CustomizedYTick}
            domain={[0, 'auto']}
          />

          <Tooltip
            content={<CustomTooltip />}
            cursor={<CustomizedCursor />}
            animationDuration={100}
            animationEasing='ease-out'
          />

          <Bar
            dataKey='deduction'
            barSize={BAR_SIZE}
            radius={[2, 2, 0, 0]}
            className='Layer__mileage-chart__bar--deduction'
            onClick={handleBarClick}
            cursor={onMonthClick ? 'pointer' : 'default'}
          >
            {chartData.map((_entry, index) => (
              <Cell key={`cell-${index}`} />
            ))}
          </Bar>

          <XAxis
            dataKey='monthName'
            tickLine={false}
            tick={{ fontSize: 12 }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </VStack>
  )
}
