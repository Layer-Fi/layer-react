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
  if (isMobile) {
    return (
      <HStack className={classNames('Layer__MetricCard', className)} align='center' gap='md'>
        <Span size='md' className='Layer__MetricCardLabel'>{slotProps.Meter.label}</Span>
        <HStack className='Layer__MetricCardMeter' align='center'>
          <Meter {...slotProps.Meter} meterOnly />
        </HStack>
        <MoneySpan size='md' weight='bold' amount={amount} />
      </HStack>
    )
  }

  return (
    <HStack className={classNames('Layer__MetricRow', className)} justify='space-between' align='center' gap='md'>
      <Span size='md' className='Layer__MetricRowLabel'>{slotProps.Meter.label}</Span>
      <HStack className='Layer__MetricRowValue' align='center' gap='md'>
        <MoneySpan size='md' weight='bold' amount={amount} />
        <Meter {...slotProps.Meter} meterOnly />
      </HStack>
    </HStack>
  )
}
