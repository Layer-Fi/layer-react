import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { tConditional } from '@utils/i18n/conditional'
import { DateFormat } from '@utils/i18n/date/patterns'
import { useTaxOverview } from '@hooks/api/businesses/[business-id]/tax-estimates/overview/useTaxOverview'
import { useTaxSummary } from '@hooks/api/businesses/[business-id]/tax-estimates/summary/useTaxSummary'
import { useIntlFormatter } from '@hooks/utils/i18n/useIntlFormatter'
import { useSizeClass } from '@hooks/utils/size/useWindowSize'
import { useFullYearProjection, useTaxEstimatesYear } from '@providers/TaxEstimatesRouteStore/TaxEstimatesRouteStoreProvider'
import { VStack } from '@ui/Stack/Stack'
import { ResponsiveDetailView } from '@components/ResponsiveDetailView/ResponsiveDetailView'
import { TaxEstimatesHeader } from '@components/TaxEstimates/TaxEstimatesHeader'
import { TaxEstimatesSummaryCard, type TaxEstimatesSummaryCardProps } from '@components/TaxEstimatesSummaryCard/TaxEstimatesSummaryCard'
import { TaxableIncomeCard, type TaxableIncomeCardProps } from '@components/TaxOverview/TaxableIncomeCard'

import '@components/TaxOverview/taxOverview.scss'
export type TaxOverviewProps = {
  incomeCard: TaxableIncomeCardProps
  summaryCard: TaxEstimatesSummaryCardProps
}

const TaxOverviewHeader = () => {
  const { t } = useTranslation()
  const { year } = useTaxEstimatesYear()
  const { formatDate } = useIntlFormatter()
  const { fullYearProjection } = useFullYearProjection()
  const { isDesktop } = useSizeClass()
  const projectedCondition: 'default' | 'projected' = fullYearProjection ? 'projected' : 'default'

  const formattedYear = formatDate(new Date(year, 0, 1), DateFormat.Year)

  const taxableIncomeTitle = tConditional(t, 'taxEstimates:label.taxable_income_for_year', {
    condition: projectedCondition,
    cases: {
      default: 'Taxable income for {{year}}',
      projected: 'Projected taxable income for {{year}}',
    },
    contexts: {
      projected: 'projected',
    },
    year: formattedYear,
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
    year: formattedYear,
  })
  return (
    <TaxEstimatesHeader
      title={taxableIncomeTitle}
      description={taxableIncomeDescription}
      isMobile={!isDesktop}
    />
  )
}

const TaxOverviewContent = (data: TaxOverviewProps) => {
  const { incomeCard, summaryCard } = data
  const { isDesktop } = useSizeClass()
  return (
    isDesktop
      ? (
        <>
          <VStack className='Layer__TaxOverview' gap='md'>
            <TaxableIncomeCard {...incomeCard} />
          </VStack>
          <TaxEstimatesSummaryCard {...summaryCard} />
        </>
      )
      : (
        <VStack className='Layer__TaxOverview' gap='md'>
          <TaxableIncomeCard {...incomeCard} />
          <TaxEstimatesSummaryCard {...summaryCard} />
        </VStack>
      )

  )
}

export const TaxOverview = () => {
  const { year } = useTaxEstimatesYear()
  const { fullYearProjection } = useFullYearProjection()
  const { isDesktop } = useSizeClass()
  const { t } = useTranslation()
  const { data: taxOverviewData } = useTaxOverview({
    year,
    fullYearProjection,
    enabled: true,
  })

  const { data: taxSummaryData } = useTaxSummary({
    year,
    fullYearProjection,
    enabled: true,
  })

  const data: TaxOverviewProps = useMemo(() => {
    if (!taxOverviewData || !taxSummaryData) {
      return {
        incomeCard: {
          deductionsTotal: 0,
          incomeTotal: 0,
        },
        summaryCard: {
          categories: [],
          layout: 'taxOverview' as const,
          title: '',
          total: 0,
        },
      }
    }
    return {
      incomeCard: {
        deductionsTotal: taxOverviewData.totalDeductions,
        incomeTotal: taxOverviewData.totalIncome,
      },
      summaryCard: {
        categories: taxSummaryData.sections.map(section => ({
          amount: section.taxesOwed,
          color: section.color,
          key: section.type,
          label: section.label,
        })),
        layout: isDesktop ? 'taxOverview' as const : 'summaryCard' as const,
        title: t('taxEstimates:label.tax_summary', 'Tax Summary'),
        total: taxSummaryData.projectedTaxesOwed,
      },
    }
  }, [isDesktop, taxSummaryData, taxOverviewData, t])

  return (
    <ResponsiveDetailView name='TaxOverview' slots={{ Header: TaxOverviewHeader }}>
      {data && <TaxOverviewContent {...data} />}
    </ResponsiveDetailView>
  )
}
