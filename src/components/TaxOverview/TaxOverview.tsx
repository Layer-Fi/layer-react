import { useTranslation } from 'react-i18next'

import {
  type TaxOverviewData,
} from '@schemas/taxEstimates/overview'
import { useTaxEstimatesYear } from '@providers/TaxEstimatesRouteStore/TaxEstimatesRouteStoreProvider'
import { VStack } from '@ui/Stack/Stack'
import type { TaxBannerReviewPayload } from '@components/TaxDetails/TaxBanner'
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

  return (
    <VStack className='Layer__TaxOverview' gap='md'>
      <VStack className='Layer__TaxOverview__PrimaryColumn' gap='md'>
        <TaxableIncomeCard
          incomeTotal={data.incomeTotal}
          deductionsTotal={data.deductionsTotal}
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
