import { useCallback, useRef, useState } from 'react'
import { Plus } from 'lucide-react'

import { type Vehicle } from '@schemas/vehicle'
import { BREAKPOINTS } from '@config/general'
import { useSizeClass } from '@hooks/useWindowSize/useWindowSize'
import { useTripsNavigation } from '@providers/TripsRouteStore/TripsRouteStoreProvider'
import BackArrow from '@icons/BackArrow'
import { Button } from '@ui/Button/Button'
import { Drawer } from '@ui/Modal/Modal'
import { ModalHeading, ModalTitleWithClose } from '@ui/Modal/ModalSlots'
import { type DefaultVariant, ResponsiveComponent } from '@ui/ResponsiveComponent/ResponsiveComponent'
import { HStack, VStack } from '@ui/Stack/Stack'
import { Switch } from '@ui/Switch/Switch'
import { Heading } from '@ui/Typography/Heading'
import { Span } from '@ui/Typography/Text'
import { BaseDetailView } from '@components/BaseDetailView/BaseDetailView'
import { Separator } from '@components/Separator/Separator'
import { VehicleForm } from '@components/VehicleManagement/VehicleForm/VehicleForm'
import { VehicleManagementGrid } from '@components/VehicleManagement/VehicleManagementGrid'

import './vehicleManagementDetail.scss'

const resolveVariant = ({ width }: { width: number }): DefaultVariant =>
  width < BREAKPOINTS.TABLET ? 'Mobile' : 'Desktop'

interface VehicleManagementDetailHeaderProps {
  onAddVehicle: () => void
  showArchived: boolean
  onShowArchivedChange: (value: boolean) => void
}

const MobileVehicleManagementDetailHeader = ({
  onAddVehicle,
  showArchived,
  onShowArchivedChange,
}: VehicleManagementDetailHeaderProps) => {
  return (
    <VStack fluid>
      <HStack justify='space-between' align='center' fluid pie='md'>
        <Heading size='sm'>Manage Vehicles</Heading>
        <Button variant='solid' onPress={onAddVehicle}>
          Add
          <Plus size={14} />
        </Button>
      </HStack>
      <Separator />
      <HStack
        justify='end'
        align='center'
        fluid
        pie='md'
        pbs='md'
      >
        <Switch isSelected={showArchived} onChange={onShowArchivedChange}>
          <Span size='sm' noWrap>Show archived</Span>
        </Switch>
      </HStack>
    </VStack>
  )
}

const DesktopVehicleManagementDetailHeader = ({
  onAddVehicle,
  showArchived,
  onShowArchivedChange,
}: VehicleManagementDetailHeaderProps) => {
  return (
    <HStack justify='space-between' align='center' fluid pie='md' gap='3xl'>
      <Heading size='sm'>Manage vehicles</Heading>
      <HStack gap='md' align='center'>
        <Switch isSelected={showArchived} onChange={onShowArchivedChange}>
          <Span size='sm' noWrap>Show archived</Span>
        </Switch>
        <Button variant='solid' onPress={onAddVehicle}>
          Add Vehicle
          <Plus size={14} />
        </Button>
      </HStack>
    </HStack>
  )
}

export const VehicleManagementDetail = () => {
  const { toTripsTable } = useTripsNavigation()
  const [isVehicleDrawerOpen, setIsVehicleDrawerOpen] = useState(false)
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | undefined>(undefined)
  const [showArchived, setShowArchived] = useState(false)
  const { isMobile } = useSizeClass()

  const handleAddVehicle = useCallback(() => {
    setSelectedVehicle(undefined)
    setIsVehicleDrawerOpen(true)
  }, [])

  const handleEditVehicle = useCallback((vehicle: Vehicle) => {
    setSelectedVehicle(vehicle)
    setIsVehicleDrawerOpen(true)
  }, [])

  const handleVehicleSuccess = useCallback((_vehicle: Vehicle) => {
    setIsVehicleDrawerOpen(false)
    setSelectedVehicle(undefined)
  }, [])

  // Use a ref to store the latest state values for the Header component
  const stateRef = useRef({ showArchived, setShowArchived, handleAddVehicle })
  stateRef.current = { showArchived, setShowArchived, handleAddVehicle }

  // Header component is stable and reads from ref
  const HeaderRef = useRef(() => {
    const { showArchived: currentShowArchived, setShowArchived: currentSetShowArchived, handleAddVehicle: currentHandleAddVehicle } = stateRef.current

    const DesktopHeader = (
      <DesktopVehicleManagementDetailHeader
        onAddVehicle={currentHandleAddVehicle}
        showArchived={currentShowArchived}
        onShowArchivedChange={currentSetShowArchived}
      />
    )

    const MobileHeader = (
      <MobileVehicleManagementDetailHeader
        onAddVehicle={currentHandleAddVehicle}
        showArchived={currentShowArchived}
        onShowArchivedChange={currentSetShowArchived}
      />
    )

    return (
      <ResponsiveComponent
        resolveVariant={resolveVariant}
        slots={{ Desktop: DesktopHeader, Mobile: MobileHeader }}
        className='Layer__VehicleManagementDetail__Header'
      />
    )
  })

  const Header = HeaderRef.current

  return (
    <>
      <BaseDetailView
        slots={{ Header, BackIcon: BackArrow }}
        name='VehicleManagementDetail'
        onGoBack={toTripsTable}
      >
        <VehicleManagementGrid onEditVehicle={handleEditVehicle} showArchived={showArchived} />
      </BaseDetailView>
      <Drawer isOpen={isVehicleDrawerOpen} onOpenChange={setIsVehicleDrawerOpen} aria-label={selectedVehicle ? 'Vehicle details' : 'Add vehicle'} variant={isMobile ? 'mobile-drawer' : 'drawer'} flexBlock={isMobile}>
        {({ close }) => (
          <VStack pb='lg'>
            <VStack pi='md'>
              <ModalTitleWithClose
                heading={(
                  <ModalHeading size='md'>
                    {selectedVehicle ? 'Edit vehicle' : 'Add vehicle'}
                  </ModalHeading>
                )}
                onClose={close}
              />
            </VStack>
            <VStack pi='md'>
              <VehicleForm vehicle={selectedVehicle} onSuccess={handleVehicleSuccess} />
            </VStack>
          </VStack>
        )}
      </Drawer>
    </>
  )
}
