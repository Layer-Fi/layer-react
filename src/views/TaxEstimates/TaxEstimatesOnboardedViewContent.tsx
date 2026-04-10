import { useCallback, useMemo } from 'react'
import type { Key } from 'react-aria-components'
import { useTranslation } from 'react-i18next'

import { translationKey } from '@utils/i18n/translationKey'
import { TaxEstimatesRoute, useTaxEstimatesNavigation, useTaxEstimatesRouteState } from '@providers/TaxEstimatesRouteStore/TaxEstimatesRouteStoreProvider'
import { Toggle } from '@ui/Toggle/Toggle'
import { TaxDetails } from '@components/TaxDetails/TaxDetails'
import { TaxPayments } from '@components/TaxPayments/TaxPayments'
import { TaxProfile } from '@views/TaxEstimates/TaxProfile'

import './taxEstimatesOnboardedViewContent.scss'

const TAX_ESTIMATES_TAB_CONFIG = [
  { value: TaxEstimatesRoute.Estimates, ...translationKey('taxEstimates:label.estimates', 'Estimates') },
  { value: TaxEstimatesRoute.Payments, ...translationKey('taxEstimates:label.payments', 'Payments') },
]

export const TaxEstimatesOnboardedViewContent = () => {
  const { t } = useTranslation()
  const { route } = useTaxEstimatesRouteState()
  const navigate = useTaxEstimatesNavigation()

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

  if (route === TaxEstimatesRoute.Profile) {
    return <TaxProfile />
  }

  return (
    <>
      <Toggle
        ariaLabel={t('taxEstimates:label.tax_estimate_view', 'Tax estimate view')}
        options={tabOptions}
        selectedKey={route}
        onSelectionChange={handleTabChange}
      />
      {route === TaxEstimatesRoute.Estimates && <TaxDetails />}
      {route === TaxEstimatesRoute.Payments && <TaxPayments />}
    </>
  )
}
