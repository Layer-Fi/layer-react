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

const CLASS_NAME_PREFIX_MAP = {
  Layer__TaxOverview: {
    metricCard: 'Layer__TaxOverview__MetricCard',
    metricCardLabel: 'Layer__TaxOverview__MetricCardLabel',
    metricCardMeter: 'Layer__TaxOverview__MetricCardMeter',
    metricRow: 'Layer__TaxOverview__MetricRow',
    metricValue: 'Layer__TaxOverview__MetricValue',
  },
} as const

export const MetricRow = ({
  amount,
  classNamePrefix,
  isMobile,
  label,
  maxMeterValue,
  meterClassName,
}: MetricRowProps) => {
  const prefixedClassNames = classNamePrefix ? CLASS_NAME_PREFIX_MAP[classNamePrefix as keyof typeof CLASS_NAME_PREFIX_MAP] : undefined
  const boundedMaxMeterValue = Math.max(maxMeterValue, 0)
  const boundedMeterValue = Math.min(Math.max(amount, 0), boundedMaxMeterValue)

  if (isMobile) {
    return (
      <HStack className={classNames('Layer__MetricCard', prefixedClassNames?.metricCard)} align='center' gap='md'>
        <Span size='md' className={classNames('Layer__MetricCardLabel', prefixedClassNames?.metricCardLabel)}>{label}</Span>
        <HStack className={classNames('Layer__MetricCardMeter', prefixedClassNames?.metricCardMeter)} align='center'>
          <Meter className={meterClassName} label={label} minValue={0} maxValue={boundedMaxMeterValue} value={boundedMeterValue} meterOnly />
        </HStack>
        <MoneySpan size='md' weight='bold' amount={amount} />
      </HStack>
    )
  }

  return (
    <HStack className={classNames('Layer__MetricRow', prefixedClassNames?.metricRow)} justify='space-between' align='center' gap='md'>
      <Span size='md'>{label}</Span>
      <HStack className={classNames('Layer__MetricValue', prefixedClassNames?.metricValue)} align='center' gap='md'>
        <MoneySpan size='md' weight='bold' amount={amount} />
        <Meter className={meterClassName} label={label} minValue={0} maxValue={boundedMaxMeterValue} value={boundedMeterValue} meterOnly />
      </HStack>
    </HStack>
  )
}
