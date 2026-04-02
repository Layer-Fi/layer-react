import { useCallback, useMemo } from 'react'
import type { TFunction } from 'i18next'
import type { Key } from 'react-aria-components'
import { useTranslation } from 'react-i18next'

import { getNextTaxFromTaxEstimatesBanner, getTaxEstimatesBannerQuarterStatus, type TaxEstimatesBanner } from '@schemas/taxEstimates/banner'
import type { TaxOverviewCategory, TaxOverviewData, TaxOverviewDeadline } from '@schemas/taxEstimates/overview'
import type { TaxSummarySection } from '@schemas/taxEstimates/summary'
import { convertCentsToDecimalString } from '@utils/format'
import { tPlural } from '@utils/i18n/plural'
import { translationKey } from '@utils/i18n/translationKey'
import { useTaxEstimatesBanner } from '@hooks/api/businesses/[business-id]/tax-estimates/banner/useTaxEstimatesBanner'
import { useTaxOverview } from '@hooks/api/businesses/[business-id]/tax-estimates/overview/useTaxOverview'
import { useTaxSummary } from '@hooks/api/businesses/[business-id]/tax-estimates/summary/useTaxSummary'
import { TaxEstimatesRoute, useFullYearProjection, useTaxEstimatesNavigation, useTaxEstimatesRouteState, useTaxEstimatesYear } from '@providers/TaxEstimatesRouteStore/TaxEstimatesRouteStoreProvider'
import { VStack } from '@ui/Stack/Stack'
import { Toggle } from '@ui/Toggle/Toggle'
import { DataState, DataStateStatus } from '@components/DataState/DataState'
import { Loader } from '@components/Loader/Loader'
import { TaxBanner, type TaxBannerReviewPayload } from '@components/TaxDetails/TaxBanner'
import { TaxDetails } from '@components/TaxDetails/TaxDetails'
import { TaxOverview } from '@components/TaxOverview/TaxOverview'
import { TaxPayments } from '@components/TaxPayments/TaxPayments'
import { ConditionalBlock } from '@components/utility/ConditionalBlock'
import { TaxProfile } from '@views/TaxEstimates/TaxProfile'

import type { TaxEstimatesViewProps } from './taxEstimatesTypes'

const TAX_ESTIMATES_TAB_CONFIG = [
  { value: TaxEstimatesRoute.Overview, ...translationKey('common:label.overview', 'Overview') },
  { value: TaxEstimatesRoute.Estimates, ...translationKey('taxEstimates:label.estimates', 'Estimates') },
  { value: TaxEstimatesRoute.Payments, ...translationKey('taxEstimates:label.payments', 'Payments') },
]

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
  sections: ReadonlyArray<Pick<TaxSummarySection, 'label' | 'taxesOwed' | 'type'>>,
): TaxOverviewCategory[] => {
  return sections.map(section => ({
    key: section.type,
    label: section.label,
    amount: section.taxesOwed,
  }))
}

const transformBannerToDeadlines = (
  banner: TaxEstimatesBanner,
  t: TFunction,
): TaxOverviewDeadline[] => {
  return banner.quarters.map(quarter => ({
    id: `quarter-${quarter.quarter}`,
    title: t('taxEstimates:label.quarter_taxes', 'Q{{quarter}} taxes', { quarter: quarter.quarter }),
    dueAt: quarter.dueDate,
    amount: quarter.balance,
    description: t('taxEstimates:label.estimated_tax', 'Estimated tax'),
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
  const { fullYearProjection } = useFullYearProjection()
  const { data: taxBannerData, isLoading: isTaxBannerLoading, isError: isTaxBannerError } = useTaxEstimatesBanner({ year })
  const { data: taxOverviewApi, isLoading: isTaxOverviewLoading, isError: isTaxOverviewError } = useTaxOverview({ year, fullYearProjection })
  const { data: taxSummary, isLoading: isTaxSummaryLoading, isError: isTaxSummaryError } = useTaxSummary({ year, fullYearProjection })

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
    const paymentDeadlines = transformBannerToDeadlines(taxBannerData, t)

    return {
      incomeTotal: taxOverviewApi.totalIncome,
      deductionsTotal: taxOverviewApi.totalDeductions,
      estimatedTaxCategories,
      estimatedTaxesTotal: taxSummary.projectedTaxesOwed,
      ...(nextTax ? { nextTax } : {}),
      paymentDeadlines,
      annualDeadline: {
        id: 'annual-income-taxes',
        title: t('taxEstimates:label.annual_income_taxes', 'Annual income taxes'),
        dueAt: new Date(year + 1, 3, 15),
        amount: taxSummary.projectedTaxesOwed,
        description: t('taxEstimates:label.estimated_tax', 'Estimated tax'),
      },
    }
  }, [taxOverviewApi, taxSummary, taxBannerData, nextTax, t, year])

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

  const isOverviewLoading = isTaxBannerLoading || isTaxOverviewLoading || isTaxSummaryLoading
  const isOverviewError = isTaxBannerError || isTaxOverviewError || isTaxSummaryError

  return (
    <VStack gap='md'>
      <Toggle
        ariaLabel={t('taxEstimates:label.tax_estimate_view', 'Tax estimate view')}
        options={tabOptions}
        selectedKey={route}
        onSelectionChange={handleTabChange}
      />
      {taxBanner}
      {route === TaxEstimatesRoute.Overview && (
        <ConditionalBlock
          isLoading={isOverviewLoading}
          isError={isOverviewError}
          data={taxOverviewData}
          Loading={<Loader />}
          Inactive={null}
          Error={(
            <DataState
              status={DataStateStatus.failed}
              title={t('taxEstimates:error.load_tax_estimates', 'We couldn\'t load your tax estimates')}
              description={t('taxEstimates:error.load_tax_estimates', 'An error occurred while loading your tax estimates. Please check your connection and try again.')}
              spacing
            />
          )}
        >
          {({ data: overviewData }) => (
            <TaxOverview
              data={overviewData}
              onTaxBannerReviewClick={onTaxBannerReviewClick}
            />
          )}
        </ConditionalBlock>
      )}
      {route === TaxEstimatesRoute.Estimates && <TaxDetails />}
      {route === TaxEstimatesRoute.Payments && <TaxPayments />}
    </VStack>
  )
}
