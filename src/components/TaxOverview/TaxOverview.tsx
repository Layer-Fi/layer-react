import { useTranslation } from 'react-i18next'

import { type TaxOverviewData } from '@schemas/taxEstimates/overview'
import { tConditional } from '@utils/i18n/conditional'
import { useSizeClass } from '@hooks/utils/size/useWindowSize'
import { useFullYearProjection, useTaxEstimatesYear } from '@providers/TaxEstimatesRouteStore/TaxEstimatesRouteStoreProvider'
import { VStack } from '@ui/Stack/Stack'
import { FullYearProjectionComboBox } from '@components/TaxEstimates/FullYearProjectionComboBox/FullYearProjectionComboBox'
import { TaxEstimatesHeader } from '@components/TaxEstimates/TaxEstimatesHeader'
import { TaxableIncomeCard } from '@components/TaxOverview/TaxableIncomeCard'

import './taxOverview.scss'

type TaxOverviewProps = {
  data: TaxOverviewData
}

export const TaxOverview = ({
  data,
}: TaxOverviewProps) => {
  const { t } = useTranslation()
  const { year } = useTaxEstimatesYear()
  const { fullYearProjection } = useFullYearProjection()
  const { isMobile } = useSizeClass()
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
    <VStack className='Layer__TaxOverview' gap='md'>
      {isMobile && (
        <TaxEstimatesHeader
          title={taxableIncomeTitle}
          description={taxableIncomeDescription}
          isMobile
        />
      )}
      <TaxableIncomeCard
        description={taxableIncomeDescription}
        incomeTotal={data.incomeTotal}
        deductionsTotal={data.deductionsTotal}
        title={taxableIncomeTitle}
        showHeader={!isMobile}
        headerAction={!isMobile ? <FullYearProjectionComboBox /> : undefined}
      />
    </VStack>
  )
}
