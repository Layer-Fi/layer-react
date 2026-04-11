import classNames from 'classnames'

import { useSizeClass } from '@hooks/utils/size/useWindowSize'
import { Meter, type MeterProps } from '@ui/Meter/Meter'
import { HStack } from '@ui/Stack/Stack'
import { MoneySpan } from '@ui/Typography/MoneySpan'
import { Span } from '@ui/Typography/Text'

import './metricRow.scss'

type MetricRowProps = {
  amount: number
  className?: string
  slotProps: {
    Meter: MeterProps
  }
}

export const MetricRow = ({
  amount,
  className,
  slotProps,
}: MetricRowProps) => {
  const { isMobile } = useSizeClass()
  const stackProps = isMobile ? { className: classNames('Layer__MetricCard', className) } : { className: classNames('Layer__MetricRow', className), justify: 'space-between' as const }
  const labelProps = isMobile ? { className: 'Layer__MetricCardLabel' } : { className: 'Layer__MetricRowLabel' }
  const meterContainerProps = isMobile ? { className: 'Layer__MetricCardMeter' } : { className: 'Layer__MetricRowValue', gap: 'md' as const }

  return (
    <HStack {...stackProps} align='center' gap='md'>
      <Span size='md' {...labelProps}>{slotProps.Meter.label}</Span>
      {isMobile && (
        <>
          <HStack {...meterContainerProps} align='center'>
            <Meter {...slotProps.Meter} meterOnly />
          </HStack>
          <MoneySpan size='md' weight='bold' amount={amount} />
        </>
      )}
      {!isMobile && (
        <HStack {...meterContainerProps} align='center'>
          <MoneySpan size='md' weight='bold' amount={amount} />
          <Meter {...slotProps.Meter} meterOnly />
        </HStack>
      )}
    </HStack>
  )
}
