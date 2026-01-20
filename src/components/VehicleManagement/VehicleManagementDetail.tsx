import { useCallback, useMemo, useRef, useState } from 'react'
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
import { VehicleForm } from '@components/VehicleManagement/VehicleForm/VehicleForm'
import { VehicleManagementGrid } from '@components/VehicleManagement/VehicleManagementGrid'

import './vehicleManagementDetailHeader.scss'

interface VehicleManagementDetailHeaderProps {
  onAddVehicle: () => void
  showArchived: boolean
  onShowArchivedChange: (value: boolean) => void
}

const resolveVariant = ({ width }: { width: number }): DefaultVariant =>
  width < BREAKPOINTS.TABLET ? 'Mobile' : 'Desktop'

const VehicleManagementDetailHeader = ({ onAddVehicle, showArchived, onShowArchivedChange }: VehicleManagementDetailHeaderProps) => {
  const DesktopViewHeader = useMemo(() => (
    <HStack justify='space-between' align='center' fluid pie='md' gap='3xl'>
      <HStack gap='md' align='center'>
        <Heading size='sm'>Manage vehicles</Heading>
        <Switch isSelected={showArchived} onChange={onShowArchivedChange}>
          <Span size='sm' noWrap>Show archived</Span>
        </Switch>
      </HStack>
      <Button variant='solid' onPress={onAddVehicle}>
        Add Vehicle
        <Plus size={14} />
      </Button>
    </HStack>
  ), [onAddVehicle, showArchived, onShowArchivedChange])

  const MobileViewHeader = useMemo(() => (
    <VStack gap='sm' pie='md'>
      <HStack justify='start'>
        <Heading size='sm'>Manage vehicles</Heading>
      </HStack>
      <HStack justify='space-between' align='center'>
        <Switch isSelected={showArchived} onChange={onShowArchivedChange}>
          <Span size='sm' noWrap>Show archived</Span>
        </Switch>
        <Button variant='solid' onPress={onAddVehicle}>
          Add Vehicle
          <Plus size={14} />
        </Button>
      </HStack>
    </VStack>
  ), [onAddVehicle, showArchived, onShowArchivedChange])

  return (
    <ResponsiveComponent resolveVariant={resolveVariant} slots={{ Desktop: DesktopViewHeader, Mobile: MobileViewHeader }} />
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

  // Use a ref to store the latest state values
  const stateRef = useRef({ showArchived, setShowArchived, handleAddVehicle })
  stateRef.current = { showArchived, setShowArchived, handleAddVehicle }

  // Header component is stable and reads from ref
  const HeaderRef = useRef(() => {
    const { showArchived: currentShowArchived, setShowArchived: currentSetShowArchived, handleAddVehicle: currentHandleAddVehicle } = stateRef.current
    return (
      <VehicleManagementDetailHeader
        onAddVehicle={currentHandleAddVehicle}
        showArchived={currentShowArchived}
        onShowArchivedChange={currentSetShowArchived}
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
