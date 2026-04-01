import { useTranslation } from 'react-i18next'

import type { TaxOverviewData } from '@schemas/taxEstimates/overview'
import { useSizeClass } from '@hooks/utils/size/useWindowSize'
import { useTaxEstimatesYear } from '@providers/TaxEstimatesRouteStore/TaxEstimatesRouteStoreProvider'
import { VStack } from '@ui/Stack/Stack'
import { Heading } from '@ui/Typography/Heading'
import { Span } from '@ui/Typography/Text'
import { Card } from '@components/Card/Card'
import { MetricRow } from '@components/MetricRow/MetricRow'

type TaxableIncomeCardProps = Pick<TaxOverviewData, 'deductionsTotal' | 'incomeTotal'>

export const TaxableIncomeCard = ({
  deductionsTotal,
  incomeTotal,
}: TaxableIncomeCardProps) => {
  const { t } = useTranslation()
  const { year } = useTaxEstimatesYear()
  const { isMobile } = useSizeClass()
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
      <VStack gap={isMobile ? 'sm' : 'md'}>
        <MetricRow
          label={t('taxEstimates:label.total_income', 'Total income')}
          amount={incomeTotal}
          maxMeterValue={maxMeterValue}
          meterClassName='Layer__TaxOverview__IncomeMeter'
          isMobile={isMobile}
        />
        <MetricRow
          label={t('taxEstimates:label.deductions', 'Deductions')}
          amount={deductionsTotal}
          maxMeterValue={maxMeterValue}
          meterClassName='Layer__TaxOverview__DeductionsMeter'
          isMobile={isMobile}
        />
      </VStack>
    </Card>
  )
}
