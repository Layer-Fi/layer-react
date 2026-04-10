import { useCallback, useMemo } from 'react'
import type { Key } from 'react-aria-components'
import { useTranslation } from 'react-i18next'

import type { TaxEstimatesBanner } from '@schemas/taxEstimates/banner'
import type { TaxOverviewData } from '@schemas/taxEstimates/overview'
import { tConditional } from '@utils/i18n/conditional'
import { translationKey } from '@utils/i18n/translationKey'
import { useTaxEstimatesBanner } from '@hooks/api/businesses/[business-id]/tax-estimates/banner/useTaxEstimatesBanner'
import { useTaxOverview } from '@hooks/api/businesses/[business-id]/tax-estimates/overview/useTaxOverview'
import { useSizeClass } from '@hooks/utils/size/useWindowSize'
import { TaxEstimatesRoute, useFullYearProjection, useTaxEstimatesNavigation, useTaxEstimatesRouteState, useTaxEstimatesYear } from '@providers/TaxEstimatesRouteStore/TaxEstimatesRouteStoreProvider'
import { VStack } from '@ui/Stack/Stack'
import { Toggle } from '@ui/Toggle/Toggle'
import { DataState, DataStateStatus } from '@components/DataState/DataState'
import { Loader } from '@components/Loader/Loader'
import { TaxBanner, type TaxBannerReviewHandler, type TaxBannerReviewPayload } from '@components/TaxDetails/TaxBanner'
import { TaxDetails } from '@components/TaxDetails/TaxDetails'
import { TaxEstimatesHeader } from '@components/TaxEstimates/TaxEstimatesHeader'
import { TaxOverview } from '@components/TaxOverview/TaxOverview'
import { TaxPayments } from '@components/TaxPayments/TaxPayments'
import { ConditionalBlock } from '@components/utility/ConditionalBlock'
import { TaxProfile } from '@views/TaxEstimates/TaxProfile'

import './taxEstimatesOnboardedViewContent.scss'

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

export type TaxEstimatesOnboardedViewContentProps = {
  onPressReviewButton: TaxBannerReviewHandler
}

export const TaxEstimatesOnboardedViewContent = ({ onPressReviewButton }: TaxEstimatesOnboardedViewContentProps) => {
  const { t } = useTranslation()
  const { route } = useTaxEstimatesRouteState()
  const isOverviewRoute = route === TaxEstimatesRoute.Overview
  const navigate = useTaxEstimatesNavigation()
  const { year } = useTaxEstimatesYear()
  const { fullYearProjection } = useFullYearProjection()
  const { data: taxBannerData } = useTaxEstimatesBanner({ year, fullYearProjection })
  const { isMobile } = useSizeClass()
  const projectedCondition: 'default' | 'projected' = fullYearProjection ? 'projected' : 'default'
  const { data: taxOverviewApi, isLoading: isTaxOverviewLoading, isError: isTaxOverviewError } = useTaxOverview({
    year,
    fullYearProjection,
    enabled: isOverviewRoute,
  })

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

  const taxOverviewData = useMemo((): TaxOverviewData | undefined => {
    if (!taxOverviewApi) {
      return undefined
    }

    return {
      incomeTotal: taxOverviewApi.totalIncome,
      deductionsTotal: taxOverviewApi.totalDeductions,
    }
  }, [taxOverviewApi])

  const taxableIncomeTitle = tConditional(t, 'taxEstimates:label.taxable_income_for_year', {
    condition: projectedCondition,
    cases: {
      default: 'Taxable income for {{year}}',
      projected: 'Projected taxable income for {{year}}',
    },
    contexts: {
      projected: 'projected',
    },
    year,
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
    year,
  })

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
      <TaxBanner
        uncategorizedReviewPayload={uncategorizedReviewPayload}
        onPressReviewButton={onPressReviewButton}
      />
      {isOverviewRoute && (
        <VStack gap='md'>
          <TaxEstimatesHeader
            title={taxableIncomeTitle}
            description={taxableIncomeDescription}
            isMobile={isMobile}
          />
          <ConditionalBlock
            isLoading={isTaxOverviewLoading}
            isError={isTaxOverviewError}
            data={taxOverviewData}
            Loading={<Loader />}
            Inactive={null}
            Error={(
              <DataState
                status={DataStateStatus.failed}
                title={t('taxEstimates:error.load_tax_estimates', 'We couldn\'t load your tax estimates')}
                description={t('taxEstimates:error.while_loading_tax_estimates', 'An error occurred while loading your tax estimates. Please check your connection and try again.')}
                spacing
              />
            )}
          >
            {({ data: overviewData }) => (
              <TaxOverview
                data={overviewData}
              />
            )}
          </ConditionalBlock>
        </VStack>
      )}
      {route === TaxEstimatesRoute.Estimates && <TaxDetails />}
      {route === TaxEstimatesRoute.Payments && <TaxPayments />}
    </VStack>
  )
}
