import { useCallback } from 'react'
import { YAxis, type YAxisProps, type YAxisTickContentProps } from 'recharts'

import { createLegacyClassNames } from '@utils/shared/styles/legacyClassNames'
import { useIntlFormatter } from '@hooks/utils/i18n/useIntlFormatter'

import './ChartYAxis.scss'

const legacyClassNames = createLegacyClassNames({
  Layer__ChartYAxis__Tick: 'Layer__ChartYAxis__tick',
})

type FormatFn = (value?: string | number) => string | number | undefined

type CustomizedYTickProps = Omit<YAxisTickContentProps, 'payload'> & {
  payload: Omit<YAxisTickContentProps['payload'], 'value'> & { value: string | number }
  format: FormatFn
}

const CustomizedYTick = ({
  format,
  payload,
  x,
  y,
  fill,
  stroke,
  textAnchor,
}: CustomizedYTickProps) => {
  return (
    <text x={x} y={y} fill={fill} stroke={stroke} textAnchor={textAnchor} className={legacyClassNames('Layer__ChartYAxis__Tick')}>
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
  const tick = (tickProps: YAxisTickContentProps) => (
    <CustomizedYTick {...tickProps} format={yAxisFormat} />
  )

  return <YAxis tick={tick} {...props} />
}
