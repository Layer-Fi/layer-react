import { useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { useTaxSummary } from '@hooks/api/businesses/[business-id]/tax-estimates/summary/useTaxSummary'
import { useSizeClass } from '@hooks/utils/size/useWindowSize'
import { useTaxEstimatesYear } from '@providers/TaxEstimatesRouteStore/TaxEstimatesRouteStoreProvider'
import { useFullYearProjection } from '@providers/TaxEstimatesRouteStore/TaxEstimatesRouteStoreProvider'
import { type DetailData, type SeriesData } from '@components/DetailedCharts/types'

export const useTaxEstimatesSummaryCard = () => {
  const { year } = useTaxEstimatesYear()
  const { fullYearProjection } = useFullYearProjection()
  const { t } = useTranslation()
  const { isDesktop, isMobile } = useSizeClass()
  const { data: taxSummaryData } = useTaxSummary({ year, fullYearProjection, enabled: true })

  const shortenedDisplayName = useCallback((key: string) => {
    if (key === 'federal') return t('taxEstimates:label.federal', 'Federal')
    if (key === 'state') return t('taxEstimates:label.state', 'State')
    return key
  }, [t])

  const DetailData = useMemo(() => {
    return {
      data: taxSummaryData?.sections.map(section => ({
        value: Math.max(section.taxesOwed, 0),
        name: section.type,
        displayName: isMobile ? shortenedDisplayName(section.type) : section.label,
      })) ?? [],
    } as DetailData<SeriesData>
  }, [taxSummaryData, isMobile, shortenedDisplayName])

  return {
    detailData: DetailData,
    layout: isDesktop ? 'taxOverview' as const : 'summaryCard' as const,
    title: t('taxEstimates:label.tax_summary', 'Tax Summary'),
  }
}
