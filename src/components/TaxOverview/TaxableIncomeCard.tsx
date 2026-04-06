import { useTranslation } from 'react-i18next'

import type { TaxOverviewData } from '@schemas/taxEstimates/overview'
import { useWindowSize } from '@hooks/utils/size/useWindowSize'
import { useTaxEstimatesYear } from '@providers/TaxEstimatesRouteStore/TaxEstimatesRouteStoreProvider'
import { VStack } from '@ui/Stack/Stack'
import { Heading } from '@ui/Typography/Heading'
import { Span } from '@ui/Typography/Text'
import { Card } from '@components/Card/Card'
import { MetricRow } from '@components/MetricRow/MetricRow'

type TaxableIncomeCardProps = Pick<TaxOverviewData, 'deductionsTotal' | 'incomeTotal'>
const METRIC_ROW_MOBILE_BREAKPOINT = 600

export const TaxableIncomeCard = ({
  deductionsTotal,
  incomeTotal,
}: TaxableIncomeCardProps) => {
  const { t } = useTranslation()
  const { year } = useTaxEstimatesYear()
  const [viewportWidth] = useWindowSize()
  const isMetricRowMobile = viewportWidth < METRIC_ROW_MOBILE_BREAKPOINT
  const maxMeterValue = Math.max(incomeTotal, deductionsTotal, 1)

  return (
    <Card className='Layer__TaxOverview__Card'>
      <VStack gap='xs'>
        <Heading level={2} size='md'>
          {t('taxEstimates:label.taxable_income_for_year', 'Taxable income for {{year}}', { year })}
        </Heading>
        <Span size='sm' variant='subtle'>
          {t(
            'taxEstimates:label.taxable_income_estimate_to_date_for_year',
            'Taxable income estimate to date for year {{year}}',
            { year },
          )}
        </Span>
      </VStack>
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
