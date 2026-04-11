import classNames from 'classnames'

import { Meter, type MeterProps } from '@ui/Meter/Meter'
import { HStack } from '@ui/Stack/Stack'
import { MoneySpan } from '@ui/Typography/MoneySpan'
import { Span } from '@ui/Typography/Text'

import './metricRow.scss'

type MetricRowStyle = 'default' | 'bordered'

type MetricRowProps = {
  amount: number
  className?: string
  style?: MetricRowStyle
  slotProps: {
    Meter: MeterProps
  }
}

export const MetricRow = ({
  amount,
  className,
  style = 'default',
  slotProps,
}: MetricRowProps) => {
  const isBordered = style === 'bordered'
  const stackProps = isBordered ? { className: classNames('Layer__MetricCard', className) } : { className: classNames('Layer__MetricRow', className), justify: 'space-between' as const }
  const labelProps = isBordered ? { className: 'Layer__MetricCardLabel' } : { className: 'Layer__MetricRowLabel' }
  const meterContainerProps = isBordered ? { className: 'Layer__MetricCardMeter' } : { className: 'Layer__MetricRowValue', gap: 'md' as const }

  return (
    <HStack {...stackProps} align='center' gap='md'>
      <Span size='md' {...labelProps}>{slotProps.Meter.label}</Span>
      {isBordered && (
        <>
          <HStack {...meterContainerProps} align='center'>
            <Meter {...slotProps.Meter} meterOnly />
          </HStack>
          <MoneySpan size='md' weight='bold' amount={amount} />
        </>
      )}
      {!isBordered && (
        <HStack {...meterContainerProps} align='center'>
          <MoneySpan size='md' weight='bold' amount={amount} />
          <Meter {...slotProps.Meter} meterOnly />
        </HStack>
      )}
    </HStack>
  )
}
