import { useCallback } from 'react'

import { type Trip } from '@schemas/trip'
import { type ModalProps } from '@ui/Modal/Modal'
import { BaseConfirmationModal } from '@ui/ConfirmationModal/BaseConfirmationModal/BaseConfirmationModal'
import { useDeleteTrip } from '@features/trips/api/useDeleteTrip'

type TripDeleteConfirmationModalProps = Pick<ModalProps, 'isOpen' | 'onOpenChange'> & {
  trip: Trip
}

export function TripDeleteConfirmationModal({
  isOpen,
  onOpenChange,
  trip,
}: TripDeleteConfirmationModalProps) {
  const { trigger: deleteTrip } = useDeleteTrip({ tripId: trip.id })

  const onConfirm = useCallback(async () => {
    await deleteTrip()
  }, [deleteTrip])

  return (
    <BaseConfirmationModal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      title='Delete this trip?'
      description='This trip will be permanently deleted. This action cannot be undone.'
      onConfirm={onConfirm}
      confirmLabel='Delete trip'
      cancelLabel='Cancel'
      errorText='Failed to delete trip. Please check your connection and try again.'
    />
  )
}
