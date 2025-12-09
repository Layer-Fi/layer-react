import { useCallback } from 'react'

import { type Vehicle } from '@schemas/vehicle'
import { type ModalProps } from '@ui/Modal/Modal'
import { BaseConfirmationModal } from '@components/BaseConfirmationModal/BaseConfirmationModal'
import { useReactivateVehicle } from '@features/vehicles/api/useReactivateVehicle'
import { getVehicleDisplayName } from '@features/vehicles/util'

type VehicleReactivateConfirmationModalProps = Pick<ModalProps, 'isOpen' | 'onOpenChange'> & {
  vehicle: Vehicle
}

export function VehicleReactivateConfirmationModal({
  isOpen,
  onOpenChange,
  vehicle,
}: VehicleReactivateConfirmationModalProps) {
  const { trigger: reactivateVehicle } = useReactivateVehicle({ vehicleId: vehicle.id })

  const onConfirm = useCallback(async () => {
    await reactivateVehicle()
  }, [reactivateVehicle])

  const vehicleName = getVehicleDisplayName(vehicle)

  return (
    <BaseConfirmationModal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      title='Reactivate this vehicle?'
      description={`${vehicleName} will be restored to your active vehicles list and available for tracking trips.`}
      onConfirm={onConfirm}
      confirmLabel='Reactivate vehicle'
      cancelLabel='Cancel'
      errorText='Failed to reactivate vehicle. Please check your connection and try again.'
    />
  )
}
