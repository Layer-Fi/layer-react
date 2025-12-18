import { YAxis } from 'recharts'

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

interface CustomizedYTickProps {
  verticalAnchor?: unknown
  visibleTicksCount?: unknown
  tickFormatter?: unknown
  payload: { value: string | number }
}

const CustomizedYTick = ({
  verticalAnchor: _verticalAnchor,
  visibleTicksCount: _visibleTicksCount,
  tickFormatter: _tickFormatter,
  payload,
  ...restProps
}: CustomizedYTickProps) => {
  return (
    <text {...restProps} className='Layer__chart_y-axis-tick'>
      <tspan dy='0.355em'>{formatYAxisValue(payload.value)}</tspan>
    </text>
  )
}

export const ProfitAndLossChartYAxis = () => {
  return <YAxis tick={CustomizedYTick} />
}
