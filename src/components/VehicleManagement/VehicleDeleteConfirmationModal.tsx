import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'

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
  const { t } = useTranslation()
  const { trigger: deleteVehicle } = useDeleteVehicle({ vehicleId: vehicle.id })

  const onConfirm = useCallback(async () => {
    await deleteVehicle()
  }, [deleteVehicle])

  const vehicleName = getVehicleDisplayName(vehicle)

  return (
    <BaseConfirmationModal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      title={t('deleteThisVehicle', 'Delete this vehicle?')}
      description={t('vehiclenameWillBePermanentlyDeletedThisActionCannotBeUndone', '{{vehicleName}} will be permanently deleted. This action cannot be undone.', { vehicleName })}
      onConfirm={onConfirm}
      confirmLabel={t('deleteVehicle', 'Delete vehicle')}
      errorText={t('failedToDeleteVehicleTryAgain', 'Failed to delete vehicle. Please check your connection and try again.')}
      useDrawer={useDrawer}
    />
  )
}
