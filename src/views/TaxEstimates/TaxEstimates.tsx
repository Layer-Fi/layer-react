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
  const { isOnboarded } = useTaxEstimatesOnboardingState()

  return (
    <View title='Tax Estimates' header={<GlobalYearPicker />}>
      {!isOnboarded ? <></> : <TaxEstimatesOnboardedViewContent />}
    </View>
  )
}

const TaxEstimatesOnboardedViewContent = () => {
  const { route } = useTaxEstimatesRouteState()
  const navigate = useTaxEstimatesNavigation()

  const handleTabChange = useCallback((key: Key) => {
    navigate(key as TaxEstimatesRoute)
  }, [navigate])

  return (
    <>
      <Toggle
        ariaLabel='Tax estimate view'
        options={[
          {
            value: TaxEstimatesRoute.Estimates,
            label: 'Estimates',
          },
          {
            value: TaxEstimatesRoute.Payments,
            label: 'Payments',
          },
        ]}
        selectedKey={route}
        onSelectionChange={handleTabChange}
      />
      <Container name='tax-estimate'>
        {route === TaxEstimatesRoute.Estimates && <></>}

        {route === TaxEstimatesRoute.Payments && <></>}
      </Container>
    </>
  )
}
