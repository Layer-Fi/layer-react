import { type Key, useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { translationKey } from '@utils/shared/i18n/translationKey'
import { useGetTaxEstimatesBanner } from '@api/businesses/[business-id]/tax-estimates/banner/get'
import { TaxEstimatesRoute, useFullYearProjection, useTaxEstimatesNavigation, useTaxEstimatesRouteState, useTaxEstimatesYear } from '@providers/features/taxEstimates/TaxEstimatesRouteStore/TaxEstimatesRouteStoreProvider'
import { VStack } from '@ui/Stack/Stack'
import { Toggle } from '@ui/Toggle/Toggle'
import { P } from '@ui/Typography/Text'
import { Container } from '@blocks/Layout/Container/Container'
import { TaxBanner } from '@features/taxEstimates/TaxBanner/TaxBanner'
import { TaxDetails } from '@features/taxEstimates/TaxDetails/TaxDetails'
import { TaxPayments } from '@features/taxEstimates/TaxPayments/TaxPayments'
import { TaxProfile } from '@views/TaxEstimates/TaxProfile'

const TAX_ESTIMATES_TAB_CONFIG = [
  // { value: TaxEstimatesRoute.Overview, ...translationKey('common:label.overview', 'Overview') },
  { value: TaxEstimatesRoute.Estimates, ...translationKey('views:TaxEstimates.TaxEstimatesOnboardedViewContent.label.estimates', 'Estimates') },
  { value: TaxEstimatesRoute.Payments, ...translationKey('views:TaxEstimates.TaxEstimatesOnboardedViewContent.label.payments', 'Payments') },
]

export const TaxEstimatesOnboardedViewContent = () => {
  const { t } = useTranslation()
  const { route } = useTaxEstimatesRouteState()
  const navigate = useTaxEstimatesNavigation()
  const { year } = useTaxEstimatesYear()
  const { fullYearProjection } = useFullYearProjection()
  const { data: taxBannerData } = useGetTaxEstimatesBanner({ year, fullYearProjection })
  const showBanner = !!taxBannerData && taxBannerData.totalUncategorizedCount > 0

  const tabOptions = useMemo(
    () => TAX_ESTIMATES_TAB_CONFIG.map(opt => ({
      value: opt.value,
      label: t(opt.i18nKey, opt.defaultValue),
    })),
    [t],
  )

  const handleTabChange = useCallback((key: Key) => {
    switch (key) {
      // case TaxEstimatesRoute.Overview:
      //   navigate.toOverview()
      //   break
      case TaxEstimatesRoute.Estimates:
        navigate.toEstimates()
        break
      case TaxEstimatesRoute.Payments:
        navigate.toPayments()
        break
      case TaxEstimatesRoute.Profile:
        navigate.toProfile()
        break
    }
  }, [navigate])

  if (route === TaxEstimatesRoute.Profile) {
    return <TaxProfile />
  }

  return (
    <VStack gap='md'>
      <Toggle
        ariaLabel={t('views:TaxEstimates.TaxEstimatesOnboardedViewContent.label.tax_estimate_view', 'Tax estimate view')}
        options={tabOptions}
        selectedKey={route}
        onSelectionChange={handleTabChange}
      />
      {showBanner && (
        <>
          <TaxBanner data={taxBannerData} />
        </>
      )}
      {/* {route === TaxEstimatesRoute.Overview && <TaxOverview />} */}
      {route === TaxEstimatesRoute.Estimates && <TaxDetails />}
      {route === TaxEstimatesRoute.Payments && <TaxPayments />}
      <Container name='TaxEstimatesDisclaimer' variant='plain'>
        <P size='xs' variant='subtle'>
          <em>
            {t(
              'views:TaxEstimates.TaxEstimatesOnboardedViewContent.disclaimer.content',
              'The Tax Estimates tool and related content are for informational purposes only, and are not intended as legal, accounting, or tax advice, or a substitute for professional counsel. We are not a financial planner or tax advisor, and users assume sole responsibility for their tax obligations, accuracy of data, and compliance with laws. All calculations are estimated and may contain errors, and are based only on the information you provide to us.',
            )}
          </em>
        </P>
      </Container>
    </VStack>
  )
}
