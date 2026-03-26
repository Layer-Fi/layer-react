import { useCallback } from 'react'
import { YAxis, type YAxisProps } from 'recharts'

import { useIntlFormatter } from '@hooks/utils/i18n/useIntlFormatter'

import './ChartYAxis.scss'

type FormatFn = (value?: string | number) => string | number | undefined

interface CustomizedYTickProps {
  verticalAnchor?: unknown
  visibleTicksCount?: unknown
  tickFormatter?: unknown
  format: FormatFn
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
  format?: FormatFn
}

export const ChartYAxis = ({ format, ...props }: ChartYAxisProps) => {
  const { formatNumber } = useIntlFormatter()
  const formatYAxisValue: FormatFn = useCallback((value) => {
    if (!value) {
      return value
    }

    const base = Number(value) / 100
    if (Number.isNaN(base)) {
      return value
    }

    return formatNumber(base, {
      notation: 'compact',
      compactDisplay: 'short',
      maximumFractionDigits: 1,
    })
  }, [formatNumber])

  const yAxisFormat = format ?? formatYAxisValue
  const tick = (tickProps: CustomizedYTickProps) => (
    <CustomizedYTick {...tickProps} format={yAxisFormat} />
  )

  return <YAxis tick={tick} {...props} />
}
