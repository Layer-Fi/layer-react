import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'

import { type Vehicle } from '@schemas/features/mileage/vehicle'
import { getVehicleDisplayName } from '@utils/features/mileage/vehicles'
import { usePostReactivateVehicle } from '@api/businesses/[business-id]/mileage/vehicles/[vehicle-id]/reactivate/post'
import { type ModalProps } from '@ui/Modal/Modal'
import { BaseConfirmationModal } from '@blocks/BaseConfirmationModal/BaseConfirmationModal'

type VehicleReactivateConfirmationModalProps = Pick<ModalProps, 'isOpen' | 'onOpenChange'> & {
  vehicle: Vehicle
  useDrawer?: boolean
}

export function VehicleReactivateConfirmationModal({
  isOpen,
  onOpenChange,
  vehicle,
  useDrawer,
}: VehicleReactivateConfirmationModalProps) {
  const { t } = useTranslation()
  const { trigger: reactivateVehicle } = usePostReactivateVehicle({ vehicleId: vehicle.id })

  const onConfirm = useCallback(async () => {
    await reactivateVehicle()
  }, [reactivateVehicle])

  const vehicleName = getVehicleDisplayName(vehicle, t)

  return (
    <BaseConfirmationModal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      title={t('mileage:VehicleReactivateConfirmationModal.prompt.reactivate_vehicle', 'Reactivate this vehicle?')}
      description={t('mileage:VehicleReactivateConfirmationModal.label.vehicle_name_restored_to_active_list', '{{vehicleName}} will be restored to your active vehicles list and available for tracking trips.', { vehicleName })}
      onConfirm={onConfirm}
      confirmLabel={t('mileage:VehicleReactivateConfirmationModal.action.reactivate_vehicle_label', 'Reactivate vehicle')}
      errorText={t('mileage:VehicleReactivateConfirmationModal.error.reactivate_vehicle', 'Failed to reactivate vehicle. Please check your connection and try again.')}
      useDrawer={useDrawer}
    />
  )
}
