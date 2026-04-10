import { useCallback, useMemo } from 'react'
import type { Key } from 'react-aria-components'
import { useTranslation } from 'react-i18next'

import type { TaxOverviewData } from '@schemas/taxEstimates/overview'
import { translationKey } from '@utils/i18n/translationKey'
import { useTaxOverview } from '@hooks/api/businesses/[business-id]/tax-estimates/overview/useTaxOverview'
import { TaxEstimatesRoute, useFullYearProjection, useTaxEstimatesNavigation, useTaxEstimatesRouteState, useTaxEstimatesYear } from '@providers/TaxEstimatesRouteStore/TaxEstimatesRouteStoreProvider'
import { VStack } from '@ui/Stack/Stack'
import { Toggle } from '@ui/Toggle/Toggle'
import { DataState, DataStateStatus } from '@components/DataState/DataState'
import { Loader } from '@components/Loader/Loader'
import { TaxDetails } from '@components/TaxDetails/TaxDetails'
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

export const TaxEstimatesOnboardedViewContent = () => {
  const { t } = useTranslation()
  const { route } = useTaxEstimatesRouteState()
  const isOverviewRoute = route === TaxEstimatesRoute.Overview
  const navigate = useTaxEstimatesNavigation()
  const { year } = useTaxEstimatesYear()
  const { fullYearProjection } = useFullYearProjection()
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

  const taxOverviewData = useMemo((): TaxOverviewData | undefined => {
    if (!taxOverviewApi) {
      return undefined
    }

    return {
      incomeTotal: taxOverviewApi.totalIncome,
      deductionsTotal: taxOverviewApi.totalDeductions,
    }
  }, [taxOverviewApi])

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
      {isOverviewRoute && (
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
            <TaxOverview data={overviewData} />
          )}
        </ConditionalBlock>
      )}
      {route === TaxEstimatesRoute.Estimates && <TaxDetails />}
      {route === TaxEstimatesRoute.Payments && <TaxPayments />}
    </VStack>
  )
}
