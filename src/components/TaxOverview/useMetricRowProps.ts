import { type TaxOverviewMetricType } from '@schemas/taxEstimates/overview'
import { useWindowSize } from '@hooks/utils/size/useWindowSize'

const METRIC_ROW_MOBILE_BREAKPOINT = 600
const meterClassByType: Record<TaxOverviewMetricType, string> = {
  TOTAL_INCOME: 'Layer__TaxOverview__IncomeMeter',
  TOTAL_PRE_AGI_DEDUCTIONS: 'Layer__TaxOverview__DeductionsMeter',
  TAXABLE_INCOME: 'Layer__TaxOverview__TaxableIncomeMeter',
  UNKNOWN_TYPE: 'Layer__TaxOverview__UnknownMetricMeter',
}

export function useMetricRowProps({ metricType, amount, maxMeterValue, label }: {
  metricType: TaxOverviewMetricType
  amount: number
  maxMeterValue: number
  label: string
}) {
  const [viewportWidth] = useWindowSize()
  const boundedMaxMeterValue = Math.max(maxMeterValue, 1)
  const boundedMeterValue = Math.min(Math.max(amount, 0), boundedMaxMeterValue)
  const showBorder = viewportWidth < METRIC_ROW_MOBILE_BREAKPOINT

  const slotProps = {
    Meter: {
      className: `${meterClassByType[metricType]} Layer__TaxOverview__Meter`,
      label,
      minValue: 0,
      value: boundedMeterValue,
      maxValue: boundedMaxMeterValue,
    },
  }
  return { slotProps, showBorder }
}
