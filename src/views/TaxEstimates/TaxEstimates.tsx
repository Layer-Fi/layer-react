import { useCallback } from 'react'
import { Menu as MenuIcon, UserRoundPen } from 'lucide-react'
import type { Key } from 'react-aria-components'

import { usePreloadTaxProfile } from '@hooks/taxEstimates/useTaxProfile'
import {
  TaxEstimatesRoute,
  TaxEstimatesRouteStoreProvider,
  useTaxEstimatesNavigation,
  useTaxEstimatesOnboardingState,
  useTaxEstimatesRouteState,
} from '@providers/TaxEstimatesRouteStore/TaxEstimatesRouteStoreProvider'
import { Button } from '@ui/Button/Button'
import { DropdownMenu, MenuItem, MenuList } from '@ui/DropdownMenu/DropdownMenu'
import { HStack } from '@ui/Stack/Stack'
import { Toggle } from '@ui/Toggle/Toggle'
import { Span } from '@ui/Typography/Text'
import { Container } from '@components/Container/Container'
import { GlobalYearPicker } from '@components/GlobalYearPicker/GlobalYearPicker'
import { TaxPayments } from '@components/TaxPayments/TaxPayments'
import { View } from '@components/View/View'
import { TaxProfile } from '@views/TaxEstimates/TaxProfile'

export const TaxEstimatesView = () => {
  usePreloadTaxProfile()

  return (
    <TaxEstimatesRouteStoreProvider>
      <TaxEstimatesViewContent />
    </TaxEstimatesRouteStoreProvider>
  )
}

const TaxEstimatesViewContent = () => {
  const { isOnboarded } = useTaxEstimatesOnboardingState()

  return (
    <View title='Tax Estimates' header={isOnboarded && <TaxEstimatesViewHeader />}>
      {isOnboarded ? <TaxEstimatesOnboardedViewContent /> : <TaxProfile />}
    </View>
  )
}

const TaxEstimatesViewHeader = () => {
  const navigate = useTaxEstimatesNavigation()

  const Trigger = useCallback(() => {
    return (
      <Button icon variant='outlined'>
        <MenuIcon size={14} />
      </Button>
    )
  }, [])

  return (
    <HStack gap='xs'>
      <GlobalYearPicker />
      <DropdownMenu
        ariaLabel='Additional actions'
        slots={{ Trigger }}
        slotProps={{ Dialog: { width: 160 } }}
      >
        <MenuList>
          <MenuItem key={TaxEstimatesRoute.Profile} onClick={() => navigate(TaxEstimatesRoute.Profile)}>
            <UserRoundPen size={20} strokeWidth={1.25} />
            <Span size='sm'>Update tax profile</Span>
          </MenuItem>
        </MenuList>
      </DropdownMenu>
    </HStack>
  )
}

const TaxEstimatesOnboardedViewContent = () => {
  const { route } = useTaxEstimatesRouteState()
  const navigate = useTaxEstimatesNavigation()

  const handleTabChange = useCallback((key: Key) => {
    navigate(key as TaxEstimatesRoute)
  }, [navigate])

  if (route === TaxEstimatesRoute.Profile) {
    return <TaxProfile />
  }

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

        {route === TaxEstimatesRoute.Payments && <TaxPayments />}
      </Container>
    </>
  )
}
