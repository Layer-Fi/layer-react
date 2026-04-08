import { useTranslation } from 'react-i18next'

import {
  type TaxOverviewData,
} from '@schemas/taxEstimates/overview'
import { tConditional } from '@utils/i18n/conditional'
import { useSizeClass } from '@hooks/utils/size/useWindowSize'
import { useFullYearProjection, useTaxEstimatesYear } from '@providers/TaxEstimatesRouteStore/TaxEstimatesRouteStoreProvider'
import { VStack } from '@ui/Stack/Stack'
import type { TaxBannerReviewPayload } from '@components/TaxDetails/TaxBanner'
import { FullYearProjectionComboBox } from '@components/TaxEstimates/FullYearProjectionComboBox/FullYearProjectionComboBox'
import { TaxEstimatesHeader } from '@components/TaxEstimates/TaxEstimatesHeader'
import { TaxEstimatesSummaryCard } from '@components/TaxEstimatesSummaryCard/TaxEstimatesSummaryCard'
import { TaxableIncomeCard } from '@components/TaxOverview/TaxableIncomeCard'
import { TaxDeadlinesCard } from '@components/TaxOverview/TaxDeadlinesCard'

import './taxOverview.scss'

type TaxOverviewProps = {
  data: TaxOverviewData
  onTaxBannerReviewClick?: (payload: TaxBannerReviewPayload) => void
}

export const TaxOverview = ({
  data,
  onTaxBannerReviewClick,
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
      <VStack className='Layer__TaxOverview__PrimaryColumn' gap='md'>
        <TaxableIncomeCard
          description={taxableIncomeDescription}
          incomeTotal={data.incomeTotal}
          deductionsTotal={data.deductionsTotal}
          title={taxableIncomeTitle}
          showHeader={!isMobile}
          headerAction={!isMobile ? <FullYearProjectionComboBox /> : undefined}
        />
        <TaxEstimatesSummaryCard
          className='Layer__TaxOverview__Card'
          title={t('taxEstimates:label.estimated_taxes_for_year', 'Estimated taxes for {{year}}', { year })}
          categories={data.estimatedTaxCategories}
          total={data.estimatedTaxesTotal}
          nextTax={data.nextTax}
        />
      </VStack>
      <TaxDeadlinesCard
        paymentDeadlines={data.paymentDeadlines}
        annualDeadline={data.annualDeadline}
        onTaxBannerReviewClick={onTaxBannerReviewClick}
      />
    </VStack>
  )
}
