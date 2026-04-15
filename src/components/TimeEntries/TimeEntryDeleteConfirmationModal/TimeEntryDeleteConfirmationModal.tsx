import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'

import { type TimeEntry } from '@schemas/timeTracking'
import { useDeleteTimeEntry } from '@hooks/api/businesses/[business-id]/time-tracking/time-entries/[time-entry-id]/useDeleteTimeEntry'
import { useSizeClass } from '@hooks/utils/size/useWindowSize'
import { type ModalProps } from '@ui/Modal/Modal'
import { BaseConfirmationModal } from '@blocks/BaseConfirmationModal/BaseConfirmationModal'

type TimeEntryDeleteConfirmationModalProps = Pick<ModalProps, 'isOpen' | 'onOpenChange'> & {
  entry: TimeEntry
  onSuccess: () => void
}

export function TimeEntryDeleteConfirmationModal({
  isOpen,
  onOpenChange,
  onSuccess,
  entry,
}: TimeEntryDeleteConfirmationModalProps) {
  const { t } = useTranslation()
  const { trigger: deleteEntry } = useDeleteTimeEntry({ timeEntryId: entry.id })
  const { isMobile } = useSizeClass()

  const onConfirm = useCallback(async () => {
    await deleteEntry()
    onSuccess()
  }, [deleteEntry, onSuccess])

  const isActive = entry.status === 'ACTIVE' || (entry.status == null && entry.stoppedAt == null)

  return (
    <BaseConfirmationModal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      title={isActive
        ? t('timeTracking:prompt.discard_timer', 'Discard this timer?')
        : t('timeTracking:prompt.delete_entry', 'Delete this time entry?')}
      description={isActive
        ? t('timeTracking:label.discard_timer_warning', 'The active timer will be discarded and no time entry will be recorded.')
        : t('timeTracking:label.delete_entry_warning', 'This time entry will be permanently deleted. This action cannot be undone.')}
      onConfirm={onConfirm}
      confirmLabel={isActive
        ? t('timeTracking:action.discard_timer', 'Discard Timer')
        : t('timeTracking:action.delete_entry', 'Delete Entry')}
      errorText={t('timeTracking:error.delete_entry', 'Failed to delete time entry. Please check your connection and try again.')}
      useDrawer={isMobile}
    />
  )
}
