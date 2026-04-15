import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import type { TaxEstimatesBannerQuarter } from '@schemas/taxEstimates/banner'
import type { TaxOverviewDeadlineStatus } from '@schemas/taxEstimates/overview'
import { useTaxEstimatesBanner } from '@hooks/api/businesses/[business-id]/tax-estimates/banner/useTaxEstimatesBanner'
import { useTaxOverview } from '@hooks/api/businesses/[business-id]/tax-estimates/overview/useTaxOverview'
import { useTaxSummary } from '@hooks/api/businesses/[business-id]/tax-estimates/summary/useTaxSummary'
import { useSizeClass, useWindowSize } from '@hooks/utils/size/useWindowSize'
import { useFullYearProjection, useTaxEstimatesYear } from '@providers/TaxEstimatesRouteStore/TaxEstimatesRouteStoreProvider'
import { HStack, VStack } from '@ui/Stack/Stack'
import { TaxEstimatesSummaryCard, type TaxEstimatesSummaryCardProps } from '@components/TaxEstimatesSummaryCard/TaxEstimatesSummaryCard'
import { TaxableIncomeCard, type TaxableIncomeCardProps } from '@components/TaxOverview/TaxableIncomeCard'
import { TaxDeadlinesCard, type TaxDeadlinesCardData } from '@components/TaxOverview/TaxDeadlinesCard'

import './taxOverview.scss'

export type TaxOverviewProps = {
  deadlinesCard: TaxDeadlinesCardData
  incomeCard: TaxableIncomeCardProps
  summaryCard: TaxEstimatesSummaryCardProps
}

const getQuarterDeadlineStatus = (quarter: TaxEstimatesBannerQuarter): TaxOverviewDeadlineStatus => {
  if (quarter.uncategorizedCount > 0) {
    return { kind: 'categorizationIncomplete' }
  }

  if (quarter.balance <= 0) {
    return { kind: 'paid' }
  }

  if (quarter.isPastDue) {
    return { kind: 'pastDue' }
  }

  return { kind: 'due' }
}

const TaxOverviewContent = ({ data }: { data: TaxOverviewProps }) => {
  const [viewportWidth] = useWindowSize()
  const isMobile = viewportWidth <= 1440
  if (!isMobile) {
    return (
      <VStack className='Layer__TaxOverview' gap='md'>
        <HStack className='Layer__TaxOverview__DesktopLayout' gap='md' align='start'>
          <VStack className='Layer__TaxOverview__PrimaryColumn' gap='md'>
            <TaxableIncomeCard data={data.incomeCard} />
            <TaxEstimatesSummaryCard data={data.summaryCard} />
          </VStack>
          <VStack className='Layer__TaxOverview__SecondaryColumn'>
            <TaxDeadlinesCard data={data.deadlinesCard} />
          </VStack>
        </HStack>
      </VStack>
    )
  }

  return (
    <VStack className='Layer__TaxOverview' gap='md'>
      <TaxableIncomeCard data={data.incomeCard} />
      <TaxEstimatesSummaryCard data={data.summaryCard} />
      <TaxDeadlinesCard data={data.deadlinesCard} />
    </VStack>
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
  const { data: taxBannerData } = useTaxEstimatesBanner({
    year,
    fullYearProjection,
  })

  const data = useMemo(() => {
    if (!taxOverviewData || !taxSummaryData || !taxBannerData) {
      return null
    }
    return {
      deadlinesCard: {
        paymentDeadlines: taxBannerData.quarters.map(quarter => ({
          amount: quarter.balance,
          description: t('taxEstimates:label.estimated_tax', 'Estimated tax'),
          dueAt: quarter.dueDate,
          id: `quarter-${quarter.quarter}`,
          reviewAction: quarter.uncategorizedCount > 0
            ? {
              payload: {
                type: 'UNCATEGORIZED_TRANSACTIONS' as const,
                count: quarter.uncategorizedCount,
                amount: quarter.uncategorizedSum,
              },
            }
            : undefined,
          status: getQuarterDeadlineStatus(quarter),
          title: t('taxEstimates:label.quarter_taxes', 'Q{{quarter}} taxes', { quarter: quarter.quarter }),
        })),
        annualDeadline: {
          amount: taxSummaryData.projectedTaxesOwed,
          description: t('taxEstimates:label.estimated_tax', 'Estimated tax'),
          dueAt: taxOverviewData.taxesDueDate ?? new Date(year + 1, 3, 15),
          id: 'annual-income-taxes',
          title: t('taxEstimates:label.annual_income_taxes', 'Annual income taxes'),
        },
      },
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
  }, [isDesktop, taxBannerData, taxSummaryData, taxOverviewData, t, year])

  return (
    <VStack className='Layer__TaxOverview' gap='md'>
      { data && (
        <TaxOverviewContent data={data} />
      )}
    </VStack>
  )
}
