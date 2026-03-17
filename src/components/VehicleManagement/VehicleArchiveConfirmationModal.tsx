import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'

import { type Vehicle } from '@schemas/vehicle'
import { getVehicleDisplayName } from '@utils/vehicles'
import { useArchiveVehicle } from '@hooks/api/businesses/[business-id]/mileage/vehicles/[vehicle-id]/useArchiveVehicle'
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
  const { trigger: archiveVehicle } = useArchiveVehicle({ vehicleId: vehicle.id })

  const onConfirm = useCallback(async () => {
    await archiveVehicle()
  }, [archiveVehicle])

  const vehicleName = getVehicleDisplayName(vehicle)

  return (
    <BaseConfirmationModal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      title={t('vehicles:prompt.archive_vehicle', 'Archive this vehicle?')}
      description={t('vehicles:label.vehicle_name_hidden_from_active_list', '{{vehicleName}} will be hidden from your active vehicles list. You can reactivate it at any time.', { vehicleName })}
      onConfirm={onConfirm}
      confirmLabel={t('vehicles:action.archive_vehicle_label', 'Archive vehicle')}
      errorText={t('vehicles:error.archive_vehicle', 'Failed to archive vehicle. Please check your connection and try again.')}
      useDrawer={useDrawer}
    />
  )
}
