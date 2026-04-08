import classNames from 'classnames'

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
  classNamePrefix?: string
}

export const MetricRow = ({
  amount,
  classNamePrefix,
  isMobile,
  label,
  maxMeterValue,
  meterClassName,
}: MetricRowProps) => {
  if (isMobile) {
    return (
      <HStack className={classNames('Layer__MetricCard', classNamePrefix && `${classNamePrefix}__MetricCard`)} align='center' gap='md'>
        <Span size='md' className={classNames('Layer__MetricCardLabel', classNamePrefix && `${classNamePrefix}__MetricCardLabel`)}>{label}</Span>
        <HStack className={classNames('Layer__MetricCardMeter', classNamePrefix && `${classNamePrefix}__MetricCardMeter`)} align='center'>
          <Meter className={meterClassName} label={label} minValue={0} maxValue={maxMeterValue} value={amount} meterOnly />
        </HStack>
        <MoneySpan size='md' weight='bold' amount={amount} />
      </HStack>
    )
  }

  return (
    <HStack className={classNames('Layer__MetricRow', classNamePrefix && `${classNamePrefix}__MetricRow`)} justify='space-between' align='center' gap='md'>
      <Span size='md'>{label}</Span>
      <HStack className={classNames('Layer__MetricValue', classNamePrefix && `${classNamePrefix}__MetricValue`)} align='center' gap='md'>
        <MoneySpan size='md' weight='bold' amount={amount} />
        <Meter className={meterClassName} label={label} minValue={0} maxValue={maxMeterValue} value={amount} meterOnly />
      </HStack>
    </HStack>
  )
}
