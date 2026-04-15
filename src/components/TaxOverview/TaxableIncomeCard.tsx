import { useTranslation } from 'react-i18next'

import { useSizeClass, useWindowSize } from '@hooks/utils/size/useWindowSize'
import { VStack } from '@ui/Stack/Stack'
import { Card } from '@components/Card/Card'
import { MetricRow } from '@components/MetricRow/MetricRow'

import './taxableIncomeCard.scss'
const METRIC_ROW_MOBILE_BREAKPOINT = 600

function useMetricRowProps({ type, amount, maxMeterValue }: { type: 'income' | 'deductions', amount: number, maxMeterValue: number }) {
  const { t } = useTranslation()
  const [viewportWidth] = useWindowSize()
  const boundedMaxMeterValue = Math.max(maxMeterValue, 0)
  const boundedMeterValue = Math.min(Math.max(amount, 0), boundedMaxMeterValue)
  const showBorder = viewportWidth < METRIC_ROW_MOBILE_BREAKPOINT

  const slotProps = {
    Meter: {
      className: type === 'income' ? 'Layer__TaxOverview__IncomeMeter' : 'Layer__TaxOverview__DeductionsMeter',
      label: type === 'income' ? t('taxEstimates:label.total_income', 'Total income') : t('taxEstimates:label.deductions', 'Deductions'),
      minValue: 0,
      value: boundedMeterValue,
      maxValue: boundedMaxMeterValue,

    },
  }
  return { slotProps, showBorder }
}

function TotalMetricRow({ type, amount, maxMeterValue }: { type: 'income' | 'deductions', amount: number, maxMeterValue: number }) {
  const { slotProps, showBorder } = useMetricRowProps({ type, amount, maxMeterValue })
  return (
    <MetricRow
      amount={amount}
      showBorder={showBorder}
      slotProps={slotProps}
    />
  )
}

export type TaxableIncomeCardProps = {
  deductionsTotal: number
  incomeTotal: number
}
export const TaxableIncomeCard = (data: TaxableIncomeCardProps) => {
  const { isDesktop } = useSizeClass()
  const { incomeTotal, deductionsTotal } = data
  const maxMeterValue = Math.max(incomeTotal, deductionsTotal, 1)

  return (
    <VStack className='Layer__TaxOverview__Card' pi={!isDesktop ? undefined : 'md'}>
      {isDesktop
        ? (
          <VStack gap='sm'>
            <TotalMetricRow type='income' amount={incomeTotal} maxMeterValue={maxMeterValue} />
            <TotalMetricRow type='deductions' amount={deductionsTotal} maxMeterValue={maxMeterValue} />
          </VStack>
        )
        : (
          <Card className='Layer__TaxOverview__Card__MetricRow--mobile'>
            <TotalMetricRow type='income' amount={incomeTotal} maxMeterValue={maxMeterValue} />
            <TotalMetricRow type='deductions' amount={deductionsTotal} maxMeterValue={maxMeterValue} />
          </Card>
        )}
    </VStack>
  )
}
