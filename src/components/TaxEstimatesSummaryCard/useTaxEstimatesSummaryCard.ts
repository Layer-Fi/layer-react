import { useTranslation } from 'react-i18next'

import { DEFAULT_CHART_COLORS } from '@utils/chartColors'
import { useTaxSummary } from '@hooks/api/businesses/[business-id]/tax-estimates/summary/useTaxSummary'
import { useSizeClass } from '@hooks/utils/size/useWindowSize'
import { useTaxEstimatesYear } from '@providers/TaxEstimatesRouteStore/TaxEstimatesRouteStoreProvider'
import { useFullYearProjection } from '@providers/TaxEstimatesRouteStore/TaxEstimatesRouteStoreProvider'

export const useTaxEstimatesSummaryCard = () => {
  const { year } = useTaxEstimatesYear()
  const { fullYearProjection } = useFullYearProjection()
  const { t } = useTranslation()
  const { isDesktop } = useSizeClass()
  const { data: taxSummaryData } = useTaxSummary({
    year,
    fullYearProjection,
    enabled: true,
  })

  return {
    categories: taxSummaryData?.sections.map((section, index) => ({
      amount: section.taxesOwed,
      color: DEFAULT_CHART_COLORS[index % DEFAULT_CHART_COLORS.length],
      key: section.type,
      label: section.label,
    })) ?? [],
    layout: isDesktop ? 'taxOverview' as const : 'summaryCard' as const,
    title: t('taxEstimates:label.tax_summary', 'Tax Summary'),
    total: taxSummaryData?.projectedTaxesOwed ?? 0,
  }
}
