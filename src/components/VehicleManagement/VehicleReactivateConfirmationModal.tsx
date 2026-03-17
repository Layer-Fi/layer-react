import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'

import { type Vehicle } from '@schemas/vehicle'
import { getVehicleDisplayName } from '@utils/vehicles'
import { useReactivateVehicle } from '@hooks/api/businesses/[business-id]/mileage/vehicles/[vehicle-id]/reactivate/useReactivateVehicle'
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
  const { trigger: reactivateVehicle } = useReactivateVehicle({ vehicleId: vehicle.id })

  const onConfirm = useCallback(async () => {
    await reactivateVehicle()
  }, [reactivateVehicle])

  const vehicleName = getVehicleDisplayName(vehicle)

  return (
    <BaseConfirmationModal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      title={t('vehicles:prompt.reactivate_vehicle', 'Reactivate this vehicle?')}
      description={t('vehicles:label.vehicle_name_restored_to_active_list', '{{vehicleName}} will be restored to your active vehicles list and available for tracking trips.', { vehicleName })}
      onConfirm={onConfirm}
      confirmLabel={t('vehicles:action.reactivate_vehicle_label', 'Reactivate vehicle')}
      errorText={t('vehicles:error.reactivate_vehicle', 'Failed to reactivate vehicle. Please check your connection and try again.')}
      useDrawer={useDrawer}
    />
  )
}
