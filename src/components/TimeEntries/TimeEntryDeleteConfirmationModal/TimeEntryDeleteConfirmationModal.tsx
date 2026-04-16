import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'

import { type TimeEntry } from '@schemas/timeTracking'
import { useDeleteTimeEntry } from '@hooks/api/businesses/[business-id]/time-tracking/time-entries/[time-entry-id]/useDeleteTimeEntry'
import { useSizeClass } from '@hooks/utils/size/useWindowSize'
import { useTimeEntriesDeleteModal } from '@providers/TimeEntriesStore/TimeEntriesStoreProvider'
import { BaseConfirmationModal } from '@blocks/BaseConfirmationModal/BaseConfirmationModal'

interface TimeEntryDeleteConfirmationModalProps {
  entry: TimeEntry
}

export function TimeEntryDeleteConfirmationModal({ entry }: TimeEntryDeleteConfirmationModalProps) {
  const { t } = useTranslation()
  const { isDeleteModalOpen, setDeleteModalOpen, onDeleteSuccess } = useTimeEntriesDeleteModal()
  const { trigger: deleteEntry } = useDeleteTimeEntry({ timeEntryId: entry.id })
  const { isMobile } = useSizeClass()

  const onConfirm = useCallback(async () => {
    await deleteEntry()
    onDeleteSuccess()
  }, [deleteEntry, onDeleteSuccess])

  const isActive = entry.status === 'ACTIVE' || (entry.status == null && entry.stoppedAt == null)

  return (
    <BaseConfirmationModal
      isOpen={isDeleteModalOpen}
      onOpenChange={setDeleteModalOpen}
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
