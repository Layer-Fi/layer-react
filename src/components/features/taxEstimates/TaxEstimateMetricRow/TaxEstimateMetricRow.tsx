import { type TaxOverviewMetric } from '@schemas/features/taxEstimates/overview'
import { MetricRow } from '@blocks/MetricRow/MetricRow'
import { useMetricRowProps } from '@features/taxEstimates/TaxEstimateMetricRow/useMetricRowProps'

export function TaxEstimateMetricRow({ metric }: { metric: TaxOverviewMetric }) {
  const { slotProps, showBorder } = useMetricRowProps({
    metricType: metric.metricType,
    amount: metric.value,
    maxMeterValue: metric.maxValue,
    label: metric.label,
  })
  return <MetricRow amount={metric.value} showBorder={showBorder} slotProps={slotProps} />
}
