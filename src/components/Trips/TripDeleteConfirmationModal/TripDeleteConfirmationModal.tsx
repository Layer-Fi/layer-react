import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'

import { type Trip } from '@schemas/trip'
import { useDeleteTrip } from '@hooks/api/businesses/[business-id]/mileage/trips/[trip-id]/useDeleteTrip'
import { useSizeClass } from '@hooks/utils/size/useWindowSize'
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
      title={t('trips:deleteThisTrip', 'Delete this trip?')}
      description={t('trips:thisTripWillBePermanentlyDeletedThisActionCannotBeUndone', 'This trip will be permanently deleted. This action cannot be undone.')}
      onConfirm={onConfirm}
      confirmLabel={t('trips:deleteTrip', 'Delete Trip')}
      errorText={t('trips:failedToDeleteTripTryAgain', 'Failed to delete trip. Please check your connection and try again.')}
      useDrawer={isMobile}
    />
  )
}
