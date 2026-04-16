import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'

import { type CatalogService } from '@schemas/catalogService'
import { useArchiveCatalogService } from '@hooks/api/businesses/[business-id]/catalog/services/[service-id]/useArchiveCatalogService'
import { useSizeClass } from '@hooks/utils/size/useWindowSize'
import { BaseConfirmationModal } from '@components/blocks/BaseConfirmationModal/BaseConfirmationModal'

type ServiceArchiveModalProps = {
  service: CatalogService
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function ServiceArchiveModal({
  service,
  isOpen,
  onOpenChange,
  onSuccess,
}: ServiceArchiveModalProps) {
  const { t } = useTranslation()
  const { isMobile } = useSizeClass()
  const { trigger: archiveService } = useArchiveCatalogService({ serviceId: service.id })

  const onConfirm = useCallback(async () => {
    await archiveService()
    onSuccess()
  }, [archiveService, onSuccess])

  return (
    <BaseConfirmationModal
      isOpen={isOpen}
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
