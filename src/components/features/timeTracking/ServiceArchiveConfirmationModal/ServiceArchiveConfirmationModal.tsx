import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'

import { type CatalogService } from '@schemas/features/timeTracking/catalogService'
import { useSizeClass } from '@hooks/utils/size/useWindowSize'
import { usePostArchiveCatalogService } from '@api/businesses/[business-id]/catalog/services/[service-id]/archive/post'
import { BaseConfirmationModal } from '@blocks/BaseConfirmationModal/BaseConfirmationModal'

type ServiceArchiveConfirmationModalProps = {
  service: CatalogService | null
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function ServiceArchiveConfirmationModal({
  service,
  isOpen,
  onOpenChange,
  onSuccess,
}: ServiceArchiveConfirmationModalProps) {
  const { t } = useTranslation()
  const { isMobile } = useSizeClass()
  const { trigger: archiveService } = usePostArchiveCatalogService({ serviceId: service?.id ?? '' })

  const onConfirm = useCallback(async () => {
    if (!service) {
      return
    }
    await archiveService()
    onSuccess()
  }, [archiveService, onSuccess, service])

  return (
    <BaseConfirmationModal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      onConfirm={onConfirm}
      title={t('timeTracking:ServiceArchiveConfirmationModal.services.archive_confirm_title', 'Archive this service?')}
      description={t('timeTracking:ServiceArchiveConfirmationModal.services.archive_confirm_description', 'This service will be removed from your active list. Time entries that used it are unchanged.')}
      confirmLabel={t('timeTracking:ServiceArchiveConfirmationModal.services.archive', 'Archive')}
      errorText={t('timeTracking:ServiceArchiveConfirmationModal.error.archive_service', 'Could not archive this service. Please try again.')}
      useDrawer={isMobile}
    />
  )
}
