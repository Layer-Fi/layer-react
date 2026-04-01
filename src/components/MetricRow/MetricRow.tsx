import { Meter } from '@ui/Meter/Meter'
import { HStack } from '@ui/Stack/Stack'
import { MoneySpan } from '@ui/Typography/MoneySpan'
import { Span } from '@ui/Typography/Text'

type MetricRowProps = {
  amount: number
  isMobile: boolean
  label: string
  maxMeterValue: number
  meterClassName: string
}

export const MetricRow = ({
  amount,
  isMobile,
  label,
  maxMeterValue,
  meterClassName,
}: MetricRowProps) => {
  if (isMobile) {
    return (
      <HStack className='Layer__MetricCard' align='center' gap='md'>
        <Span size='md' className='Layer__MetricCardLabel'>{label}</Span>
        <HStack className='Layer__MetricCardMeter' align='center'>
          <Meter className={meterClassName} label={label} minValue={0} maxValue={maxMeterValue} value={amount} meterOnly />
        </HStack>
        <MoneySpan size='md' weight='bold' amount={amount} />
      </HStack>
    )
  }

  return (
    <HStack className='Layer__MetricRow' justify='space-between' align='center' gap='md'>
      <Span size='md'>{label}</Span>
      <HStack className='Layer__MetricValue' align='center' gap='md'>
        <MoneySpan size='md' weight='bold' amount={amount} />
        <Meter className={meterClassName} label={label} minValue={0} maxValue={maxMeterValue} value={amount} meterOnly />
      </HStack>
    </HStack>
  )
}
