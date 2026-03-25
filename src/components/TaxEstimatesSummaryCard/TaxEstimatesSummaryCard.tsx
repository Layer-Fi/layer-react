import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { getNextTaxFromTaxEstimatesBanner } from '@schemas/taxEstimates/banner'
import { type TaxOverviewData } from '@schemas/taxEstimates/overview'
import { useTaxEstimatesBanner } from '@hooks/api/businesses/[business-id]/tax-estimates/banner/useTaxEstimatesBanner'
import { useTaxOverview } from '@hooks/api/businesses/[business-id]/tax-estimates/overview/useTaxOverview'
import { useGlobalDate } from '@providers/GlobalDateStore/GlobalDateStoreProvider'
import { Loader } from '@components/Loader/Loader'
import { TaxEstimatesOverviewSummary } from '@components/TaxEstimatesSummaryCard/TaxEstimatesOverviewSummary'
import { ConditionalBlock } from '@components/utility/ConditionalBlock'

type TaxEstimatesSummaryCardData = {
  estimatedTaxCategories: TaxOverviewData['estimatedTaxCategories']
  estimatedTaxesTotal: number
  nextTax: NonNullable<ReturnType<typeof getNextTaxFromTaxEstimatesBanner>>
  year: number
}

export const TaxEstimatesSummaryCard = () => {
  const { t } = useTranslation()
  const { date } = useGlobalDate({ dateSelectionMode: 'month' })
  const year = date.getFullYear()
  const { data: taxOverview, isLoading: isTaxOverviewLoading, isError: isTaxOverviewError } = useTaxOverview({ year })
  const { data: taxBanner, isLoading: isTaxBannerLoading, isError: isTaxBannerError } = useTaxEstimatesBanner({ year })

  const data = useMemo((): TaxEstimatesSummaryCardData | undefined => {
    if (!taxOverview || !taxBanner) {
      return
    }

    const nextTax = getNextTaxFromTaxEstimatesBanner(taxBanner)
    if (!nextTax) {
      return
    }

    return {
      estimatedTaxCategories: taxOverview.estimatedTaxCategories,
      estimatedTaxesTotal: taxOverview.estimatedTaxesTotal,
      nextTax,
      year,
    }
  }, [taxBanner, taxOverview, year])

  return (
    <ConditionalBlock
      data={data}
      isLoading={isTaxOverviewLoading || isTaxBannerLoading}
      isError={isTaxOverviewError || isTaxBannerError}
      Loading={<Loader />}
      Inactive={null}
      Error={null}
    >
      {({ data }) => (
        <TaxEstimatesOverviewSummary
          layout='summaryCard'
          title={t('taxEstimates:label.estimated_taxes_for_year', 'Estimated taxes for {{year}}', { year: data.year })}
          categories={data.estimatedTaxCategories}
          total={data.estimatedTaxesTotal}
          nextTax={data.nextTax}
        />
      )}
    </ConditionalBlock>
  )
}
