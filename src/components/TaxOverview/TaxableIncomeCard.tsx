import { useTranslation } from 'react-i18next'

import { tConditional } from '@utils/i18n/conditional'
import { useWindowSize } from '@hooks/utils/size/useWindowSize'
import { useFullYearProjection, useTaxEstimatesYear } from '@providers/TaxEstimatesRouteStore/TaxEstimatesRouteStoreProvider'
import { VStack } from '@ui/Stack/Stack'
import { Card } from '@components/Card/Card'
import { MetricRow } from '@components/MetricRow/MetricRow'
import { TaxEstimatesHeader } from '@components/TaxEstimates/TaxEstimatesHeader'

import './taxableIncomeCard.scss'
const METRIC_ROW_MOBILE_BREAKPOINT = 786

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

const TaxOverviewHeader = () => {
  const { t } = useTranslation()
  const { year } = useTaxEstimatesYear()
  const { fullYearProjection } = useFullYearProjection()
  const projectedCondition: 'default' | 'projected' = fullYearProjection ? 'projected' : 'default'
  const taxableIncomeTitle = tConditional(t, 'taxEstimates:label.taxable_income_for_year', {
    condition: projectedCondition,
    cases: {
      default: 'Taxable income for {{year}}',
      projected: 'Projected taxable income for {{year}}',
    },
    contexts: {
      projected: 'projected',
    },
    year,
  })

  const taxableIncomeDescription = tConditional(t, 'taxEstimates:label.taxable_income_estimate_to_date_for_year', {
    condition: projectedCondition,
    cases: {
      default: 'Taxable income estimate to date for year {{year}}',
      projected: 'Taxable income projection for year {{year}}',
    },
    contexts: {
      projected: 'projected',
    },
    year,
  })
  return (
    <TaxEstimatesHeader
      title={taxableIncomeTitle}
      description={taxableIncomeDescription}
    />
  )
}

export type TaxableIncomeCardProps = {
  deductionsTotal: number
  incomeTotal: number
}

export const TaxableIncomeCard = ({
  data,
}: { data: TaxableIncomeCardProps }) => {
  const [viewportWidth] = useWindowSize()
  const isMobile = viewportWidth <= 960
  const maxMeterValue = Math.max(data.incomeTotal, data.deductionsTotal, 1)

  return (
    <VStack className='Layer__TaxOverview__Card Layer__TaxOverview__Card--income'>
      {isMobile
        ? (
          <Card className='Layer__TaxOverview__Card__MetricRow--mobile'>
            <TaxOverviewHeader />
            <TotalIncomeMetricRow totalIncome={data.incomeTotal} maxMeterValue={maxMeterValue} />
            <DeductionsMetricRow totalDeductions={data.deductionsTotal} maxMeterValue={maxMeterValue} />
          </Card>
        )
        : (
          <Card>
            <VStack gap='sm' pb='lg' pi='lg'>
              <TaxOverviewHeader />
              <TotalIncomeMetricRow totalIncome={data.incomeTotal} maxMeterValue={maxMeterValue} />
              <DeductionsMetricRow totalDeductions={data.deductionsTotal} maxMeterValue={maxMeterValue} />
            </VStack>
          </Card>
        )}
    </VStack>
  )
}
