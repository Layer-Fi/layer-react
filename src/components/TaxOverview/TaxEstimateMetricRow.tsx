import { type TaxOverviewMetric } from '@schemas/taxEstimates/overview'
import { MetricRow } from '@components/MetricRow/MetricRow'
import { useMetricRowProps } from '@components/TaxOverview/useMetricRowProps'

export function TaxEstimateMetricRow({ metric }: { metric: TaxOverviewMetric }) {
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
