import { YAxis, type YAxisProps } from 'recharts'

import './ChartYAxis.scss'

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
  format: (value?: string | number) => string | number | undefined
  payload: { value: string | number }
}

const CustomizedYTick = ({
  verticalAnchor: _verticalAnchor,
  visibleTicksCount: _visibleTicksCount,
  tickFormatter: _tickFormatter,
  format,
  payload,
  ...restProps
}: CustomizedYTickProps) => {
  return (
    <text {...restProps} className='Layer__ChartYAxis__tick'>
      <tspan dy='0.355em'>{format(payload.value)}</tspan>
    </text>
  )
}

type ChartYAxisProps = Omit<YAxisProps, 'format'> & {
  format: (value?: string | number) => string | number | undefined
}

export const ChartYAxis = ({ format = formatYAxisValue, ...props }: ChartYAxisProps) => {
  const tick = (tickProps: CustomizedYTickProps) => (
    <CustomizedYTick {...tickProps} format={format} />
  )

  return <YAxis tick={tick} {...props} />
}
