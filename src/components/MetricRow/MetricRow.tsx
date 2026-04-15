import classNames from 'classnames'

import { Meter, type MeterProps } from '@ui/Meter/Meter'
import { HStack } from '@ui/Stack/Stack'
import { MoneySpan } from '@ui/Typography/MoneySpan'
import { Span } from '@ui/Typography/Text'

import './metricRow.scss'

type MetricRowProps = {
  amount: number
  className?: string
  showBorder?: boolean
  slotProps: {
    Meter: MeterProps
  }
}

export const MetricRow = ({
  amount,
  className,
  showBorder = false,
  slotProps,
}: MetricRowProps) => {
  const stackProps = {
    className: classNames(className, {
      Layer__MetricCard: showBorder,
      Layer__MetricRow: !showBorder,
    }),
    ...(!showBorder && { justify: 'space-between' as const }),
  }

  const labelProps = {
    className: classNames({
      Layer__MetricCard__Label: showBorder,
      Layer__MetricRow__Label: !showBorder,
    }),
  }

  const meterContainerProps = {
    className: classNames({
      Layer__MetricCard__Meter: showBorder,
      Layer__MetricRow__Value: !showBorder,
    }),
    gap: 'md' as const,
  }

  return (
    <HStack {...stackProps} align='center' gap='md'>
      <Span size='md' {...labelProps}>{slotProps.Meter.label}</Span>
      {showBorder && (
        <>
          <HStack {...meterContainerProps} align='center'>
            <Meter {...slotProps.Meter} meterOnly />
          </HStack>
          <MoneySpan size='md' weight='bold' amount={amount} />
        </>
      )}
      {!showBorder && (
        <HStack {...meterContainerProps} align='center'>
          <MoneySpan size='md' weight='bold' amount={amount} />
          <Meter {...slotProps.Meter} meterOnly />
        </HStack>
      )}
    </HStack>
  )
}
