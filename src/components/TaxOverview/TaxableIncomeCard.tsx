import { type TaxOverviewMetric, type TaxOverviewMetricType } from '@schemas/taxEstimates/overview'
import { useSizeClass, useWindowSize } from '@hooks/utils/size/useWindowSize'
import { VStack } from '@ui/Stack/Stack'
import { Card } from '@components/Card/Card'
import { MetricRow } from '@components/MetricRow/MetricRow'

import './taxableIncomeCard.scss'
const METRIC_ROW_MOBILE_BREAKPOINT = 600
type TaxableIncomeCardProps = {
  metrics: readonly TaxOverviewMetric[]
}

function useMetricRowProps({ metricType, amount, maxMeterValue, label }: { metricType: TaxOverviewMetricType, amount: number, maxMeterValue: number, label: string }) {
  const [viewportWidth] = useWindowSize()
  const boundedMaxMeterValue = Math.max(maxMeterValue, 0)
  const boundedMeterValue = Math.min(Math.max(amount, 0), boundedMaxMeterValue)
  const showBorder = viewportWidth < METRIC_ROW_MOBILE_BREAKPOINT

  const meterClassByType: Record<TaxOverviewMetricType, string> = {
    TOTAL_INCOME: 'Layer__TaxOverview__IncomeMeter',
    TOTAL_PRE_AGI_DEDUCTIONS: 'Layer__TaxOverview__DeductionsMeter',
    TAXABLE_INCOME: 'Layer__TaxOverview__TaxableIncomeMeter',
  }

  const slotProps = {
    Meter: {
      className: meterClassByType[metricType],
      label,
      minValue: 0,
      value: boundedMeterValue,
      maxValue: boundedMaxMeterValue,
    },
  }
  return { slotProps, showBorder }
}

function TotalMetricRow({ metric }: { metric: TaxOverviewMetric }) {
  const { slotProps, showBorder } = useMetricRowProps({
    metricType: metric.metricType,
    amount: metric.value,
    maxMeterValue: metric.maxValue,
    label: metric.label,
  })
  return (
    <MetricRow
      amount={metric.value}
      showBorder={showBorder}
      slotProps={slotProps}
    />
  )
}

export const TaxableIncomeCard = ({
  metrics,
}: TaxableIncomeCardProps) => {
  const { isDesktop } = useSizeClass()

  return (
    <VStack className='Layer__TaxOverview__Card' pi={!isDesktop ? undefined : 'md'}>
      {isDesktop
        ? (
          <VStack gap='sm'>
            {metrics.map(metric => <TotalMetricRow key={metric.metricType} metric={metric} />)}
          </VStack>
        )
        : (
          <Card className='Layer__TaxOverview__Card__MetricRow--mobile'>
            {metrics.map(metric => <TotalMetricRow key={metric.metricType} metric={metric} />)}
          </Card>
        )}
    </VStack>
  )
}
