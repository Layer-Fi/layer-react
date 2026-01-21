import { useCallback, useState } from 'react'
import { Plus } from 'lucide-react'

import { type Vehicle } from '@schemas/vehicle'
import { useSizeClass } from '@hooks/useWindowSize/useWindowSize'
import { useTripsNavigation } from '@providers/TripsRouteStore/TripsRouteStoreProvider'
import BackArrow from '@icons/BackArrow'
import { Button } from '@ui/Button/Button'
import { Drawer } from '@ui/Modal/Modal'
import { ModalHeading, ModalTitleWithClose } from '@ui/Modal/ModalSlots'
import { HStack, VStack } from '@ui/Stack/Stack'
import { Switch } from '@ui/Switch/Switch'
import { Heading } from '@ui/Typography/Heading'
import { Span } from '@ui/Typography/Text'
import { BaseDetailView } from '@components/BaseDetailView/BaseDetailView'
import { VehicleForm } from '@components/VehicleManagement/VehicleForm/VehicleForm'
import { VehicleManagementGrid } from '@components/VehicleManagement/VehicleManagementGrid'

interface VehicleManagementDetailHeaderProps {
  onAddVehicle: () => void
  showArchived: boolean
  onShowArchivedChange: (value: boolean) => void
  title: string
  buttonText: string
}

const VehicleManagementDetailHeader = ({
  onAddVehicle,
  showArchived,
  onShowArchivedChange,
  title,
  buttonText,
}: VehicleManagementDetailHeaderProps) => (
  <HStack justify='space-between' align='center' fluid pie='md' gap='3xl'>
    <Heading size='sm'>{title}</Heading>
    <HStack gap='md' align='center'>
      <Switch isSelected={showArchived} onChange={onShowArchivedChange}>
        <Span size='sm' noWrap>Show archived</Span>
      </Switch>
      <Button variant='solid' onPress={onAddVehicle}>
        {buttonText}
        <Plus size={14} />
      </Button>
    </HStack>
  </HStack>
)

export const VehicleManagementDetail = () => {
  const { toTripsTable } = useTripsNavigation()
  const [isVehicleDrawerOpen, setIsVehicleDrawerOpen] = useState(false)
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | undefined>(undefined)
  const [showArchived, setShowArchived] = useState(false)
  const { isDesktop } = useSizeClass()

  const mobileHeader = !isDesktop

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

  const vehicleManagementDetailHeader = useCallback(() => {
    return (
      <VehicleManagementDetailHeader
        onAddVehicle={handleAddVehicle}
        showArchived={showArchived}
        onShowArchivedChange={setShowArchived}
        title={mobileHeader ? 'Vehicles' : 'Manage vehicles'}
        buttonText={mobileHeader ? 'Add' : 'Add Vehicle'}
      />
    )
  }, [handleAddVehicle, showArchived, setShowArchived, mobileHeader])

  return (
    <>
      <BaseDetailView
        slots={{ Header: vehicleManagementDetailHeader, BackIcon: BackArrow }}
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
