import { useCallback, useMemo } from 'react'
import type { Key } from 'react-aria-components'
import { useTranslation } from 'react-i18next'

import type { TaxEstimatesBanner } from '@schemas/taxEstimates/banner'
import { translationKey } from '@utils/i18n/translationKey'
import { useTaxEstimatesBanner } from '@hooks/api/businesses/[business-id]/tax-estimates/banner/useTaxEstimatesBanner'
import { TaxEstimatesRoute, useFullYearProjection, useTaxEstimatesNavigation, useTaxEstimatesRouteState, useTaxEstimatesYear } from '@providers/TaxEstimatesRouteStore/TaxEstimatesRouteStoreProvider'
import { VStack } from '@ui/Stack/Stack'
import { Toggle } from '@ui/Toggle/Toggle'
import { TaxBanner, type TaxBannerReviewHandler, type TaxBannerReviewPayload } from '@components/TaxDetails/TaxBanner'
import { TaxDetails } from '@components/TaxDetails/TaxDetails'
import { TaxPayments } from '@components/TaxPayments/TaxPayments'
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
  const navigate = useTaxEstimatesNavigation()
  const { year } = useTaxEstimatesYear()
  const { fullYearProjection } = useFullYearProjection()
  const { data: taxBannerData } = useTaxEstimatesBanner({ year, fullYearProjection })

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
      {route === TaxEstimatesRoute.Estimates && <TaxDetails />}
      {route === TaxEstimatesRoute.Payments && <TaxPayments />}
    </VStack>
  )
}
