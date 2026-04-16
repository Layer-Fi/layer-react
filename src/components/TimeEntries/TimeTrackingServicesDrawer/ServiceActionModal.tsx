import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'

import { type CatalogService } from '@schemas/catalogService'
import { useArchiveCatalogService } from '@hooks/api/businesses/[business-id]/catalog/services/[service-id]/useArchiveCatalogService'
import { useReactivateCatalogService } from '@hooks/api/businesses/[business-id]/catalog/services/[service-id]/useReactivateCatalogService'
import { useSizeClass } from '@hooks/utils/size/useWindowSize'
import { BaseConfirmationModal } from '@components/blocks/BaseConfirmationModal/BaseConfirmationModal'

type ServiceActionModalProps = {
  service: CatalogService
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function ServiceArchiveModal({
  service,
  onOpenChange,
  onSuccess,
}: ServiceActionModalProps) {
  const { t } = useTranslation()
  const { isMobile } = useSizeClass()
  const { trigger: archiveService } = useArchiveCatalogService({ serviceId: service.id })

  const onConfirm = useCallback(async () => {
    await archiveService()
    onSuccess()
  }, [archiveService, onSuccess])

  return (
    <BaseConfirmationModal
      isOpen={true}
      onOpenChange={onOpenChange}
      onConfirm={onConfirm}
      title={t('timeTracking:services.archive_confirm_title', 'Archive this service?')}
      description={t('timeTracking:services.archive_confirm_description', 'This service will be removed from your active list. Time entries that used it are unchanged.')}
      confirmLabel={t('timeTracking:services.archive', 'Archive')}
      errorText={t('timeTracking:error.archive_service', 'Could not archive this service. Please try again.')}
      useDrawer={isMobile}
    />
  )
}

export function ServiceRestoreModal({
  service,
  onOpenChange,
  onSuccess,
}: ServiceActionModalProps) {
  const { t } = useTranslation()
  const { isMobile } = useSizeClass()
  const { trigger: reactivateService } = useReactivateCatalogService({ serviceId: service.id })

  const onConfirm = useCallback(async () => {
    await reactivateService()
    onSuccess()
  }, [onSuccess, reactivateService])

  return (
    <BaseConfirmationModal
      isOpen={true}
      onOpenChange={onOpenChange}
      onConfirm={onConfirm}
      title={t('timeTracking:services.unarchive_confirm_title', 'Restore this service?')}
      description={t('timeTracking:services.unarchive_confirm_description', 'This service will appear in your active list again.')}
      confirmLabel={t('timeTracking:services.unarchive', 'Restore')}
      errorText={t('timeTracking:error.unarchive_service', 'Could not restore this service. Please try again.')}
      useDrawer={isMobile}
    />
  )
}
