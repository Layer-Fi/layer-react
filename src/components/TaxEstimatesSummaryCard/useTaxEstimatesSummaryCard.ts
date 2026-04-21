import { useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { type TaxSummary, type TaxSummarySectionType } from '@schemas/taxEstimates/summary'
import { useTaxSummary } from '@hooks/api/businesses/[business-id]/tax-estimates/summary/useTaxSummary'
import { useSizeClass } from '@hooks/utils/size/useWindowSize'
import { useTaxEstimatesYear } from '@providers/TaxEstimatesRouteStore/TaxEstimatesRouteStoreProvider'
import { useFullYearProjection } from '@providers/TaxEstimatesRouteStore/TaxEstimatesRouteStoreProvider'
import { type DetailData, type SeriesData } from '@components/DetailedCharts/types'

const prepareTaxSummaryData = (taxSummaryData: TaxSummary, shortenedDisplayName: (type: TaxSummarySectionType) => string, isMobile: boolean) => {
  return taxSummaryData.sections.map(section => ({
    value: Math.max(section.taxesOwed, 0),
    name: section.type,
    displayName: isMobile ? shortenedDisplayName(section.type) : section.label,
  }))
}

export const useTaxEstimatesSummaryCard = () => {
  const { year } = useTaxEstimatesYear()
  const { fullYearProjection } = useFullYearProjection()
  const { t } = useTranslation()
  const { isDesktop, isMobile } = useSizeClass()
  const { data: taxSummaryData, isLoading, isError } = useTaxSummary({ year, fullYearProjection, enabled: true })

  const shortenedDisplayName = useCallback((type: TaxSummarySectionType) => {
    if (type === 'federal') return t('taxEstimates:label.federal', 'Federal')
    if (type === 'state') return t('taxEstimates:label.state', 'State')
    return type
  }, [t])

  const detailData = useMemo(() => {
    if (!taxSummaryData) return null

    const data = prepareTaxSummaryData(taxSummaryData, shortenedDisplayName, isMobile)
    return {
      data,
      total: data.reduce((sum, section) => sum + section.value, 0),
    } as DetailData<SeriesData>
  }, [taxSummaryData, isMobile, shortenedDisplayName])

  return {
    detailData,
    isLoading,
    isError,
    layout: isDesktop ? 'taxOverview' as const : 'summaryCard' as const,
    title: t('taxEstimates:label.tax_summary', 'Tax Summary'),
  }
}
