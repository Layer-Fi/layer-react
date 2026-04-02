import { useCallback, useMemo } from 'react'
import type { Key } from 'react-aria-components'
import { useTranslation } from 'react-i18next'

import { getNextTaxFromTaxEstimatesBanner, getTaxEstimatesBannerQuarterStatus, type TaxEstimatesBanner } from '@schemas/taxEstimates/banner'
import type { TaxOverviewCategory, TaxOverviewCategoryKey, TaxOverviewData, TaxOverviewDeadline } from '@schemas/taxEstimates/overview'
import { convertCentsToDecimalString } from '@utils/format'
import { tPlural } from '@utils/i18n/plural'
import { translationKey } from '@utils/i18n/translationKey'
import { useTaxEstimatesBanner } from '@hooks/api/businesses/[business-id]/tax-estimates/banner/useTaxEstimatesBanner'
import { useTaxOverview } from '@hooks/api/businesses/[business-id]/tax-estimates/overview/useTaxOverview'
import { useTaxSummary } from '@hooks/api/businesses/[business-id]/tax-estimates/summary/useTaxSummary'
import { TaxEstimatesRoute, useTaxEstimatesNavigation, useTaxEstimatesRouteState, useTaxEstimatesYear } from '@providers/TaxEstimatesRouteStore/TaxEstimatesRouteStoreProvider'
import { VStack } from '@ui/Stack/Stack'
import { Toggle } from '@ui/Toggle/Toggle'
import { TaxBanner, type TaxBannerReviewPayload } from '@components/TaxDetails/TaxBanner'
import { TaxDetails } from '@components/TaxDetails/TaxDetails'
import { TaxOverview } from '@components/TaxOverview/TaxOverview'
import { TaxPayments } from '@components/TaxPayments/TaxPayments'
import { TaxProfile } from '@views/TaxEstimates/TaxProfile'

import type { TaxEstimatesViewProps } from './taxEstimatesTypes'

const TAX_ESTIMATES_TAB_CONFIG = [
  { value: TaxEstimatesRoute.Overview, ...translationKey('common:label.overview', 'Overview') },
  { value: TaxEstimatesRoute.Estimates, ...translationKey('taxEstimates:label.estimates', 'Estimates') },
  { value: TaxEstimatesRoute.Payments, ...translationKey('taxEstimates:label.payments', 'Payments') },
]

const TAX_OVERVIEW_CATEGORY_KEYS: readonly TaxOverviewCategoryKey[] = ['federal', 'state', 'selfEmployment']

const getTaxBannerReviewPayload = (taxBanner?: TaxEstimatesBanner): TaxBannerReviewPayload | undefined => {
  if (!taxBanner || taxBanner.totalUncategorizedCount <= 0) {
    return
  }

  return {
    type: 'UNCATEGORIZED_TRANSACTIONS',
    count: taxBanner.totalUncategorizedCount,
    amount: taxBanner.totalUncategorizedSum,
  }
}

const transformSummaryToCategories = (
  sections: ReadonlyArray<{ label: string, taxesOwed: number }>,
): TaxOverviewCategory[] => {
  return sections
    .map((section, index): TaxOverviewCategory | undefined => {
      const key = TAX_OVERVIEW_CATEGORY_KEYS[index]

      if (!key) {
        return
      }

      return {
        key,
        label: section.label,
        amount: section.taxesOwed,
      }
    })
    .filter((category): category is TaxOverviewCategory => category !== undefined)
}

const transformBannerToDeadlines = (
  banner: TaxEstimatesBanner,
): TaxOverviewDeadline[] => {
  return banner.quarters.map(quarter => ({
    id: `quarter-${quarter.quarter}`,
    title: `Q${quarter.quarter} taxes`,
    dueAt: quarter.dueDate,
    amount: quarter.balance,
    description: 'Estimated tax',
    status: getTaxEstimatesBannerQuarterStatus(quarter),
    reviewAction: quarter.uncategorizedCount > 0
      ? {
        payload: {
          type: 'UNCATEGORIZED_TRANSACTIONS',
          count: quarter.uncategorizedCount,
          amount: quarter.uncategorizedSum,
        },
      }
      : undefined,
  }))
}

export const TaxEstimatesOnboardedViewContent = ({ onTaxBannerReviewClick }: TaxEstimatesViewProps) => {
  const { t } = useTranslation()
  const { route } = useTaxEstimatesRouteState()
  const navigate = useTaxEstimatesNavigation()
  const { year } = useTaxEstimatesYear()
  const { data: taxBannerData } = useTaxEstimatesBanner({ year })
  const { data: taxOverviewApi } = useTaxOverview({ year })
  const { data: taxSummary } = useTaxSummary({ year })

  const handleTaxBannerReview = useCallback((payload: TaxBannerReviewPayload) => {
    onTaxBannerReviewClick?.(payload)
  }, [onTaxBannerReviewClick])

  const tabOptions = useMemo(
    () => TAX_ESTIMATES_TAB_CONFIG.map(opt => ({
      value: opt.value,
      label: t(opt.i18nKey, opt.defaultValue),
    })),
    [t],
  )

  const handleTabChange = useCallback((key: Key) => {
    navigate(key as TaxEstimatesRoute)
  }, [navigate])

  const uncategorizedReviewPayload = useMemo(
    () => getTaxBannerReviewPayload(taxBannerData),
    [taxBannerData],
  )
  const nextTax = useMemo(
    () => getNextTaxFromTaxEstimatesBanner(taxBannerData),
    [taxBannerData],
  )

  const taxOverviewData = useMemo((): TaxOverviewData | undefined => {
    if (!taxOverviewApi || !taxSummary || !taxBannerData) {
      return undefined
    }

    const estimatedTaxCategories = transformSummaryToCategories(taxSummary.sections)
    const paymentDeadlines = transformBannerToDeadlines(taxBannerData)

    return {
      incomeTotal: taxOverviewApi.totalIncome,
      deductionsTotal: taxOverviewApi.totalDeductions,
      estimatedTaxCategories,
      estimatedTaxesTotal: taxSummary.projectedTaxesOwed,
      ...(nextTax ? { nextTax } : {}),
      paymentDeadlines,
      annualDeadline: {
        id: 'annual-income-taxes',
        title: 'Annual income taxes',
        dueAt: new Date(year + 1, 3, 15),
        amount: taxSummary.projectedTaxesOwed,
        description: 'Estimated tax',
      },
    }
  }, [taxOverviewApi, taxSummary, taxBannerData, nextTax, year])

  const taxBanner = uncategorizedReviewPayload && (
    <VStack>
      <TaxBanner
        title={t('taxEstimates:banner.categorization_incomplete.title', 'Your tax estimates are incomplete')}
        description={tPlural(
          t,
          'taxEstimates:banner.categorization_incomplete.description',
          {
            count: uncategorizedReviewPayload.count,
            amount: convertCentsToDecimalString(uncategorizedReviewPayload.amount),
            one: 'You have {{count}} uncategorized transaction with ${{amount}} in potential deductions to review.',
            other: 'You have {{count}} uncategorized transactions with ${{amount}} in potential deductions to review.',
          },
        )}
        action={{
          label: t('taxEstimates:action.review_banner', 'Review'),
          onPress: handleTaxBannerReview,
          payload: uncategorizedReviewPayload,
        }}
      />
    </VStack>
  )

  if (route === TaxEstimatesRoute.Profile) {
    return <TaxProfile />
  }

  return (
    <VStack gap='md'>
      <Toggle
        ariaLabel={t('taxEstimates:label.tax_estimate_view', 'Tax estimate view')}
        options={tabOptions}
        selectedKey={route}
        onSelectionChange={handleTabChange}
      />
      {taxBanner}
      {route === TaxEstimatesRoute.Overview && taxOverviewData && (
        <TaxOverview
          data={taxOverviewData}
          onTaxBannerReviewClick={onTaxBannerReviewClick}
        />
      )}
      {route === TaxEstimatesRoute.Estimates && <TaxDetails />}
      {route === TaxEstimatesRoute.Payments && <TaxPayments />}
    </VStack>
  )
}
