import { useCallback, useMemo } from 'react'
import { getYear } from 'date-fns'
import { Menu as MenuIcon, UserRoundPen } from 'lucide-react'
import type { Key } from 'react-aria-components'

import { convertDateToZonedDateTime } from '@utils/time/timeUtils'
import { useBusinessActivationDate } from '@hooks/business/useBusinessActivationDate'
import {
  TaxEstimatesRoute,
  TaxEstimatesRouteStoreProvider,
  useTaxEstimatesNavigation,
  useTaxEstimatesOnboardingState,
  useTaxEstimatesRouteState,
  useTaxEstimatesYear,
} from '@providers/TaxEstimatesRouteStore/TaxEstimatesRouteStoreProvider'
import { Button } from '@ui/Button/Button'
import { DropdownMenu, MenuItem, MenuList } from '@ui/DropdownMenu/DropdownMenu'
import { HStack } from '@ui/Stack/Stack'
import { Toggle } from '@ui/Toggle/Toggle'
import { Span } from '@ui/Typography/Text'
import { Container } from '@components/Container/Container'
import { Loader } from '@components/Loader/Loader'
import { TaxDetails } from '@components/TaxDetails/TaxDetails'
import { TaxPayments } from '@components/TaxPayments/TaxPayments'
import { View } from '@components/View/View'
import { YearPicker } from '@components/YearPicker/YearPicker'
import { TaxProfile } from '@views/TaxEstimates/TaxProfile'

const TAX_ESTIMATES_MIN_YEAR = 2024

export const TaxEstimatesView = () => {
  return (
    <TaxEstimatesRouteStoreProvider>
      <TaxEstimatesViewContent />
    </TaxEstimatesRouteStoreProvider>
  )
}

const TaxEstimatesViewContent = () => {
  const { isOnboarded } = useTaxEstimatesOnboardingState()
  const header = useMemo(() => isOnboarded && <TaxEstimatesViewHeader />, [isOnboarded])

  const viewContent = useMemo(() => {
    if (isOnboarded === undefined) return (
      <Container name='tax-estimates'>
        <Loader />
      </Container>
    )
    if (isOnboarded === false) return <TaxProfile />
    return <TaxEstimatesOnboardedViewContent />
  }, [isOnboarded])

  return (
    <View title='Taxes' header={header}>
      {viewContent}
    </View>
  )
}

const TaxEstimatesViewHeader = () => {
  const navigate = useTaxEstimatesNavigation()
  const { year, setYear } = useTaxEstimatesYear()
  const activationDate = useBusinessActivationDate()

  const minDateZdt = useMemo(() => {
    const activationYear = activationDate ? getYear(activationDate) : TAX_ESTIMATES_MIN_YEAR
    const effectiveMinYear = Math.max(activationYear, TAX_ESTIMATES_MIN_YEAR)
    return convertDateToZonedDateTime(new Date(effectiveMinYear, 0, 1))
  }, [activationDate])

  const maxDateZdt = useMemo(() => convertDateToZonedDateTime(new Date()), [])

  const Trigger = useCallback(() => {
    return (
      <Button icon variant='outlined'>
        <MenuIcon size={14} />
      </Button>
    )
  }, [])

  return (
    <HStack gap='xs'>
      <YearPicker
        year={year}
        onChange={setYear}
        minDate={minDateZdt}
        maxDate={maxDateZdt}
      />
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
      {route === TaxEstimatesRoute.Estimates && <TaxDetails />}
      {route === TaxEstimatesRoute.Payments && <TaxPayments />}
    </>
  )
}
