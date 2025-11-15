import { Heading } from '@ui/Typography/Heading'
import { useCallback, useState } from 'react'
import { BaseDetailView } from '@components/BaseDetailView/BaseDetailView'
import { HStack, VStack } from '@ui/Stack/Stack'
import { useTripsNavigation } from '@providers/TripsRouteStore/TripsRouteStoreProvider'
import BackArrow from '@icons/BackArrow'
import { VehicleManagementGrid } from '@components/VehicleManagement/VehicleManagementGrid'
import { Button } from '@ui/Button/Button'
import { Plus } from 'lucide-react'
import { Drawer } from '@ui/Modal/Modal'
import { ModalHeading, ModalTitleWithClose } from '@ui/Modal/ModalSlots'
import { VehicleForm } from '@components/VehicleManagement/VehicleForm/VehicleForm'
import { type Vehicle } from '@schemas/vehicle'

interface VehicleManagementDetailHeaderProps {
  onAddVehicle: () => void
}

const VehicleManagementDetailHeader = ({ onAddVehicle }: VehicleManagementDetailHeaderProps) => {
  return (
    <HStack justify='space-between' align='center' fluid pie='md'>
      <Heading size='sm'>Manage vehicles</Heading>
      <Button variant='solid' onPress={onAddVehicle}>
        Add Vehicle
        <Plus size={14} />
      </Button>
    </HStack>
  )
}

export const VehicleManagementDetail = () => {
  const { toTripsTable } = useTripsNavigation()
  const [isVehicleDrawerOpen, setIsVehicleDrawerOpen] = useState(false)
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | undefined>(undefined)

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

  const Header = useCallback(() => {
    return (
      <VehicleManagementDetailHeader onAddVehicle={handleAddVehicle} />
    )
  }, [handleAddVehicle])

  return (
    <>
      <BaseDetailView
        slots={{ Header, BackIcon: BackArrow }}
        name='VehicleManagementDetail'
        onGoBack={toTripsTable}
      >
        <VehicleManagementGrid onEditVehicle={handleEditVehicle} />
      </BaseDetailView>
      <Drawer isOpen={isVehicleDrawerOpen} onOpenChange={setIsVehicleDrawerOpen} aria-label={selectedVehicle ? 'Vehicle details' : 'Add vehicle'}>
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
