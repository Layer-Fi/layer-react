import { useTranslation } from 'react-i18next'

import { type TaxOverviewIncomeCard } from '@schemas/taxEstimates/overview'
import { useSizeClass, useWindowSize } from '@hooks/utils/size/useWindowSize'
import { VStack } from '@ui/Stack/Stack'
import { Card } from '@components/Card/Card'
import { MetricRow } from '@components/MetricRow/MetricRow'

import './taxableIncomeCard.scss'
const METRIC_ROW_MOBILE_BREAKPOINT = 600

function TotalIncomeMetricRow({ totalIncome, maxMeterValue }: { totalIncome: number, maxMeterValue: number }) {
  const { t } = useTranslation()
  const [viewportWidth] = useWindowSize()
  const boundedMaxMeterValue = Math.max(maxMeterValue, 0)
  const boundedMeterValue = Math.min(Math.max(totalIncome, 0), boundedMaxMeterValue)
  const slotProps = {
    Meter: {
      label: t('taxEstimates:label.total_income', 'Total income'),
      minValue: 0,
      value: boundedMeterValue,
      className: 'Layer__TaxOverview__IncomeMeter',
      maxValue: boundedMaxMeterValue,
    },
  }
  return (
    <MetricRow
      amount={totalIncome}
      style={viewportWidth < METRIC_ROW_MOBILE_BREAKPOINT ? 'bordered' : 'default'}
      className='Layer__TaxOverview_TotalIncomeMeter'
      slotProps={slotProps}
    />

  )
}

function DeductionsMetricRow({ totalDeductions, maxMeterValue }: { totalDeductions: number, maxMeterValue: number }) {
  const { t } = useTranslation()
  const [viewportWidth] = useWindowSize()
  const boundedMaxMeterValue = Math.max(maxMeterValue, 0)
  const boundedMeterValue = Math.min(Math.max(totalDeductions, 0), boundedMaxMeterValue)
  const slotProps = {
    Meter: {
      label: t('taxEstimates:label.deductions', 'Deductions'),
      minValue: 0,
      value: boundedMeterValue,
      className: 'Layer__TaxOverview__DeductionsMeter',
      maxValue: boundedMaxMeterValue,
    },
  }
  return (
    <MetricRow
      amount={totalDeductions}
      style={viewportWidth < METRIC_ROW_MOBILE_BREAKPOINT ? 'bordered' : 'default'}
      className='Layer__TaxOverview_DeductionsMeter'
      slotProps={slotProps}
    />
  )
}

export const TaxableIncomeCard = ({
  data,
}: { data: TaxOverviewIncomeCard }) => {
  const { isDesktop } = useSizeClass()
  const maxMeterValue = Math.max(data.incomeTotal, data.deductionsTotal, 1)

  return (
    <VStack className='Layer__TaxOverview__Card' pi={!isDesktop ? undefined : 'md'}>
      {!isDesktop
        ? (
          <Card className='Layer__TaxOverview__Card__MetricRow--mobile'>
            <TotalIncomeMetricRow totalIncome={data.incomeTotal} maxMeterValue={maxMeterValue} />
            <DeductionsMetricRow totalDeductions={data.deductionsTotal} maxMeterValue={maxMeterValue} />
          </Card>
        )
        : (
          <VStack gap='sm'>
            <TotalIncomeMetricRow totalIncome={data.incomeTotal} maxMeterValue={maxMeterValue} />
            <DeductionsMetricRow totalDeductions={data.deductionsTotal} maxMeterValue={maxMeterValue} />
          </VStack>
        )}
    </VStack>
  )
}
