import { useCallback } from 'react'
import type { Key } from 'react-aria-components'

import {
  TaxEstimatesRoute,
  TaxEstimatesRouteStoreProvider,
  useTaxEstimatesNavigation,
  useTaxEstimatesOnboardingState,
  useTaxEstimatesRouteState,
} from '@providers/TaxEstimatesRouteStore/TaxEstimatesRouteStoreProvider'
import { Toggle } from '@ui/Toggle/Toggle'
import { Container } from '@components/Container/Container'
import { GlobalYearPicker } from '@components/GlobalYearPicker/GlobalYearPicker'
import { View } from '@components/View/View'

export const TaxEstimatesView = () => {
  return (
    <TaxEstimatesRouteStoreProvider>
      <TaxEstimatesViewContent />
    </TaxEstimatesRouteStoreProvider>
  )
}

const TaxEstimatesViewContent = () => {
  const { route } = useTaxEstimatesRouteState()
  const navigate = useTaxEstimatesNavigation()
  const { isOnboarded } = useTaxEstimatesOnboardingState()

  const handleTabChange = useCallback((key: Key) => {
    navigate(key as TaxEstimatesRoute)
  }, [navigate])

  return (
    <View
      title='Tax Estimates'
      showHeader
      header={<GlobalYearPicker />}
    >
      <Toggle
        ariaLabel='Tax estimate view'
        options={[
          {
            value: TaxEstimatesRoute.Overview,
            label: 'Overview',
          },
          {
            value: TaxEstimatesRoute.Estimates,
            label: 'Estimates',
            disabled: !isOnboarded,
            disabledMessage: 'Please complete your tax profile first',
          },
          {
            value: TaxEstimatesRoute.Payments,
            label: 'Payments',
            disabled: !isOnboarded,
            disabledMessage: 'Please complete your tax profile first',
          },
          {
            value: TaxEstimatesRoute.Profile,
            label: 'Tax Profile',
          },
        ]}
        selectedKey={route}
        onSelectionChange={handleTabChange}
      />
      <Container name='tax-estimate'>
        {route === TaxEstimatesRoute.Overview && <></>}

        {route === TaxEstimatesRoute.Estimates && <></>}

        {route === TaxEstimatesRoute.Payments && <></>}

        {route === TaxEstimatesRoute.Profile && <></>}

      </Container>
    </View>
  )
}
