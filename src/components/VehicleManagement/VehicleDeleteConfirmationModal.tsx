import { useCallback } from 'react'

import { type Vehicle } from '@schemas/vehicle'
import { getVehicleDisplayName } from '@utils/vehicles'
import { useDeleteVehicle } from '@hooks/api/businesses/[business-id]/mileage/vehicles/[vehicle-id]/useDeleteVehicle'
import { type ModalProps } from '@ui/Modal/Modal'
import { BaseConfirmationModal } from '@blocks/BaseConfirmationModal/BaseConfirmationModal'

type VehicleDeleteConfirmationModalProps = Pick<ModalProps, 'isOpen' | 'onOpenChange'> & {
  vehicle: Vehicle
  useDrawer?: boolean
}

export function VehicleDeleteConfirmationModal({
  isOpen,
  onOpenChange,
  vehicle,
  useDrawer,
}: VehicleDeleteConfirmationModalProps) {
  const { trigger: deleteVehicle } = useDeleteVehicle({ vehicleId: vehicle.id })

  const onConfirm = useCallback(async () => {
    await deleteVehicle()
  }, [deleteVehicle])

  const vehicleName = getVehicleDisplayName(vehicle)

  return (
    <BaseConfirmationModal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      title='Delete this vehicle?'
      description={`${vehicleName} will be permanently deleted. This action cannot be undone.`}
      onConfirm={onConfirm}
      confirmLabel='Delete vehicle'
      cancelLabel='Cancel'
      errorText='Failed to delete vehicle. Please check your connection and try again.'
      useDrawer={useDrawer}
    />
  )
}
