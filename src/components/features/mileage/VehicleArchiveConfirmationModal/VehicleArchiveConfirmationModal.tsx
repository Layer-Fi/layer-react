import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'

import { type Vehicle } from '@schemas/features/mileage/vehicle'
import { getVehicleDisplayName } from '@utils/features/mileage/vehicles'
import { usePostArchiveVehicle } from '@api/businesses/[business-id]/mileage/vehicles/[vehicle-id]/archive/post'
import { type ModalProps } from '@ui/Modal/Modal'
import { BaseConfirmationModal } from '@blocks/BaseConfirmationModal/BaseConfirmationModal'

type VehicleArchiveConfirmationModalProps = Pick<ModalProps, 'isOpen' | 'onOpenChange'> & {
  vehicle: Vehicle
  useDrawer?: boolean
}

export function VehicleArchiveConfirmationModal({
  isOpen,
  onOpenChange,
  vehicle,
  useDrawer,
}: VehicleArchiveConfirmationModalProps) {
  const { t } = useTranslation()
  const { trigger: archiveVehicle } = usePostArchiveVehicle({ vehicleId: vehicle.id })

  const onConfirm = useCallback(async () => {
    await archiveVehicle()
  }, [archiveVehicle])

  const vehicleName = getVehicleDisplayName(vehicle, t)

  return (
    <BaseConfirmationModal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      title={t('mileage:VehicleArchiveConfirmationModal.prompt.archive_vehicle', 'Archive this vehicle?')}
      description={t('mileage:VehicleArchiveConfirmationModal.label.vehicle_name_hidden_from_active_list', '{{vehicleName}} will be hidden from your active vehicles list. You can reactivate it at any time.', { vehicleName })}
      onConfirm={onConfirm}
      confirmLabel={t('mileage:VehicleArchiveConfirmationModal.action.archive_vehicle_label', 'Archive vehicle')}
      errorText={t('mileage:VehicleArchiveConfirmationModal.error.archive_vehicle', 'Failed to archive vehicle. Please check your connection and try again.')}
      useDrawer={useDrawer}
    />
  )
}
