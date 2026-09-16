import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'

import { type Trip } from '@schemas/features/mileage/trip'
import { useSizeClass } from '@hooks/utils/size/useWindowSize'
import { useDeleteTrip } from '@api/businesses/[business-id]/mileage/trips/[trip-id]/delete'
import { type ModalProps } from '@ui/Modal/Modal'
import { BaseConfirmationModal } from '@blocks/BaseConfirmationModal/BaseConfirmationModal'

type TripDeleteConfirmationModalProps = Pick<ModalProps, 'isOpen' | 'onOpenChange'> & {
  trip: Trip
  onSuccess: () => void
}

export function TripDeleteConfirmationModal({
  isOpen,
  onOpenChange,
  onSuccess,
  trip,
}: TripDeleteConfirmationModalProps) {
  const { t } = useTranslation()
  const { trigger: deleteTrip } = useDeleteTrip({ tripId: trip.id })
  const { isMobile } = useSizeClass()

  const onConfirm = useCallback(async () => {
    await deleteTrip()
    onSuccess()
  }, [deleteTrip, onSuccess])

  return (
    <BaseConfirmationModal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      title={t('mileage:TripDeleteConfirmationModal.prompt.delete_trip', 'Delete this trip?')}
      description={t('mileage:TripDeleteConfirmationModal.label.delete_trip_warning', 'This trip will be permanently deleted. This action cannot be undone.')}
      onConfirm={onConfirm}
      confirmLabel={t('mileage:TripDeleteConfirmationModal.action.delete_trip', 'Delete Trip')}
      errorText={t('mileage:TripDeleteConfirmationModal.error.delete_trip', 'Failed to delete trip. Please check your connection and try again.')}
      useDrawer={isMobile}
    />
  )
}
