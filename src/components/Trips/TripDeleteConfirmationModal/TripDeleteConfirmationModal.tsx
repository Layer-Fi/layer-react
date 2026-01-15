import { useCallback } from 'react'

import { type Trip } from '@schemas/trip'
import { useSizeClass } from '@hooks/useWindowSize/useWindowSize'
import { type ModalProps } from '@ui/Modal/Modal'
import { BaseConfirmationModal } from '@blocks/BaseConfirmationModal/BaseConfirmationModal'
import { useDeleteTrip } from '@features/trips/api/useDeleteTrip'

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
      title='Delete this trip?'
      description='This trip will be permanently deleted. This action cannot be undone.'
      onConfirm={onConfirm}
      confirmLabel='Delete Trip'
      cancelLabel='Cancel'
      errorText='Failed to delete trip. Please check your connection and try again.'
      useDrawer={isMobile}
    />
  )
}
