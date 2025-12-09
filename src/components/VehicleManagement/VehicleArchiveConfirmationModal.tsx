import { useCallback } from 'react'

import { type Vehicle } from '@schemas/vehicle'
import { type ModalProps } from '@ui/Modal/Modal'
import { BaseConfirmationModal } from '@components/BaseConfirmationModal/BaseConfirmationModal'
import { useArchiveVehicle } from '@features/vehicles/api/useArchiveVehicle'
import { getVehicleDisplayName } from '@features/vehicles/util'

type VehicleArchiveConfirmationModalProps = Pick<ModalProps, 'isOpen' | 'onOpenChange'> & {
  vehicle: Vehicle
}

export function VehicleArchiveConfirmationModal({
  isOpen,
  onOpenChange,
  vehicle,
}: VehicleArchiveConfirmationModalProps) {
  const { trigger: archiveVehicle } = useArchiveVehicle({ vehicleId: vehicle.id })

  const onConfirm = useCallback(async () => {
    await archiveVehicle()
  }, [archiveVehicle])

  const vehicleName = getVehicleDisplayName(vehicle)

  return (
    <BaseConfirmationModal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      title='Archive this vehicle?'
      description={`${vehicleName} will be hidden from your active vehicles list. You can reactivate it at any time.`}
      onConfirm={onConfirm}
      confirmLabel='Archive vehicle'
      cancelLabel='Cancel'
      errorText='Failed to archive vehicle. Please check your connection and try again.'
    />
  )
}
