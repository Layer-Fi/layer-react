import { t } from 'i18next'
import { Loader } from 'lucide-react'

import { tConditional } from '@utils/i18n/conditional'
import { useTaxOverview } from '@hooks/api/businesses/[business-id]/tax-estimates/overview/useTaxOverview'
import { useSizeClass } from '@hooks/utils/size/useWindowSize'
import { useFullYearProjection, useTaxEstimatesYear } from '@providers/TaxEstimatesRouteStore/TaxEstimatesRouteStoreProvider'
import { VStack } from '@ui/Stack/Stack'
import { DataState, DataStateStatus } from '@components/DataState/DataState'
import { TaxEstimatesHeader } from '@components/TaxEstimates/TaxEstimatesHeader'
import { TaxableIncomeCard } from '@components/TaxOverview/TaxableIncomeCard'
import { ConditionalBlock } from '@components/utility/ConditionalBlock'

import './taxOverview.scss'

export const TaxOverview = () => {
  const { year } = useTaxEstimatesYear()
  const { fullYearProjection } = useFullYearProjection()
  const { isMobile } = useSizeClass()
  const projectedCondition: 'default' | 'projected' = fullYearProjection ? 'projected' : 'default'
  const { data, isLoading: isTaxOverviewLoading, isError: isTaxOverviewError } = useTaxOverview({
    year,
    fullYearProjection,
    enabled: true,
  })

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

      <TaxEstimatesHeader
        title={taxableIncomeTitle}
        description={taxableIncomeDescription}
        isMobile={isMobile}
      />
      <ConditionalBlock
        isLoading={isTaxOverviewLoading}
        isError={isTaxOverviewError}
        data={data}
        Loading={<Loader />}
        Inactive={null}
        Error={(
          <DataState
            status={DataStateStatus.failed}
            title={t('taxEstimates:error.load_tax_estimates', 'We couldn\'t load your tax estimates')}
            description={t('taxEstimates:error.while_loading_tax_estimates', 'An error occurred while loading your tax estimates. Please check your connection and try again.')}
            spacing
          />
        )}
      >
        {({ data: overviewData }) => (
          <TaxableIncomeCard
            incomeTotal={overviewData.totalIncome}
            deductionsTotal={overviewData.totalDeductions}
            showHeader={false}
          />
        )}
      </ConditionalBlock>
    </VStack>
  )
}
