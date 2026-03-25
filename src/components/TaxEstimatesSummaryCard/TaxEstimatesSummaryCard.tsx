import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { getNextTaxFromTaxEstimatesBanner } from '@schemas/taxEstimates/banner'
import type { TaxOverviewCategory, TaxOverviewCategoryKey } from '@schemas/taxEstimates/overview'
import { useTaxEstimatesBanner } from '@hooks/api/businesses/[business-id]/tax-estimates/banner/useTaxEstimatesBanner'
import { useTaxSummary } from '@hooks/api/businesses/[business-id]/tax-estimates/summary/useTaxSummary'
import { useGlobalDate } from '@providers/GlobalDateStore/GlobalDateStoreProvider'
import { Loader } from '@components/Loader/Loader'
import { TaxEstimatesOverviewSummary } from '@components/TaxEstimatesSummaryCard/TaxEstimatesOverviewSummary'
import { ConditionalBlock } from '@components/utility/ConditionalBlock'

type TaxEstimatesSummaryCardData = {
  estimatedTaxCategories: TaxOverviewCategory[]
  estimatedTaxesTotal: number
  nextTax: NonNullable<ReturnType<typeof getNextTaxFromTaxEstimatesBanner>>
  year: number
}

const SECTION_TO_CATEGORY_KEY: Record<string, TaxOverviewCategoryKey> = {
  'Federal Income & Self-Employment Tax': 'federal',
  'State Income Tax': 'state',
}

const transformSummaryToCategories = (sections: ReadonlyArray<{ label: string, taxesOwed: number }>): TaxOverviewCategory[] => {
  return sections
    .map((section): TaxOverviewCategory | undefined => {
      const key = SECTION_TO_CATEGORY_KEY[section.label]
      if (!key) return undefined
      return {
        key,
        label: key === 'federal' ? 'Federal + SE' : 'State',
        amount: section.taxesOwed,
      }
    })
    .filter((category): category is TaxOverviewCategory => category !== undefined)
}

export const TaxEstimatesSummaryCard = () => {
  const { t } = useTranslation()
  const { date } = useGlobalDate({ dateSelectionMode: 'month' })
  const year = date.getFullYear()
  const { data: taxSummary, isLoading: isTaxSummaryLoading, isError: isTaxSummaryError } = useTaxSummary({ year })
  const { data: taxBanner, isLoading: isTaxBannerLoading, isError: isTaxBannerError } = useTaxEstimatesBanner({ year })

  const data = useMemo((): TaxEstimatesSummaryCardData | undefined => {
    if (!taxSummary || !taxBanner) {
      return
    }

    const nextTax = getNextTaxFromTaxEstimatesBanner(taxBanner)
    if (!nextTax) {
      return
    }

    return {
      estimatedTaxCategories: transformSummaryToCategories(taxSummary.sections),
      estimatedTaxesTotal: taxSummary.projectedTaxesOwed,
      nextTax,
      year,
    }
  }, [taxBanner, taxSummary, year])

  return (
    <ConditionalBlock
      data={data}
      isLoading={isTaxSummaryLoading || isTaxBannerLoading}
      isError={isTaxSummaryError || isTaxBannerError}
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
