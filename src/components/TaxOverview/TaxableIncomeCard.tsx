import { useTranslation } from 'react-i18next'

import type { TaxOverviewIncomeCard } from '@schemas/taxEstimates/overview'
import { useWindowSize } from '@hooks/utils/size/useWindowSize'
import { VStack } from '@ui/Stack/Stack'
import { Card } from '@components/Card/Card'
import { MetricRow } from '@components/MetricRow/MetricRow'

const METRIC_ROW_MOBILE_BREAKPOINT = 600

type TaxableIncomeCardProps = Pick<TaxOverviewIncomeCard, 'deductionsTotal' | 'incomeTotal'>

export const TaxableIncomeCard = ({ deductionsTotal, incomeTotal }: TaxableIncomeCardProps) => {
  const { t } = useTranslation()
  const [viewportWidth] = useWindowSize()
  const isMetricRowMobile = viewportWidth < METRIC_ROW_MOBILE_BREAKPOINT
  const maxMeterValue = Math.max(incomeTotal, deductionsTotal, 1)

  return (
    <Card className='Layer__TaxOverview__Card'>
      <VStack gap={isMetricRowMobile ? 'sm' : 'md'}>
        <MetricRow
          label={t('taxEstimates:label.total_income', 'Total income')}
          amount={incomeTotal}
          classNamePrefix='Layer__TaxOverview'
          maxMeterValue={maxMeterValue}
          meterClassName='Layer__TaxOverview__IncomeMeter'
          isMobile={isMetricRowMobile}
        />
        <MetricRow
          label={t('taxEstimates:label.deductions', 'Deductions')}
          amount={deductionsTotal}
          classNamePrefix='Layer__TaxOverview'
          maxMeterValue={maxMeterValue}
          meterClassName='Layer__TaxOverview__DeductionsMeter'
          isMobile={isMetricRowMobile}
        />
      </VStack>
    </Card>
  )
}
