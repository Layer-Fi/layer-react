import classNames from 'classnames'

import { Meter, type MeterProps } from '@ui/Meter/Meter'
import { HStack, Stack } from '@ui/Stack/Stack'
import { MoneySpan } from '@ui/Typography/MoneySpan'
import { Span } from '@ui/Typography/Text'

import './metricRow.scss'

type MetricRowBaseProps = {
  amount: number
  slotProps: {
    Meter: MeterProps
  }
}

const BorderedMetricRow = ({ amount, slotProps }: MetricRowBaseProps) => {
  return (
    <>
      <HStack className='Layer__MetricCard__Meter' align='start' justify='space-between'>
        <Span size='md' className='Layer__MetricCard__Label'>{slotProps.Meter.label}</Span>
        <MoneySpan size='md' amount={amount} />
      </HStack>
      <Meter {...slotProps.Meter} meterOnly />
    </>
  )
}

const StandardMetricRow = ({ amount, slotProps }: MetricRowBaseProps) => {
  return (
    <>
      <Span size='md' className='Layer__MetricRow__Label'>{slotProps.Meter.label}</Span>
      <HStack className='Layer__MetricRow__Value' align='center' gap='md'>
        <MoneySpan size='md' weight='bold' amount={amount} />
        <Meter {...slotProps.Meter} meterOnly />
      </HStack>
    </>
  )
}

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
    align: !showBorder ? 'center' as const : undefined,
    direction: showBorder ? 'column' as const : 'row' as const,
    ...(!showBorder && { justify: 'space-between' as const }),
  }
  const metricProps = { amount, slotProps }
  return (
    <Stack {...stackProps} gap='md'>
      {showBorder ? <BorderedMetricRow {...metricProps} /> : <StandardMetricRow {...metricProps} />}
    </Stack>
  )
}
