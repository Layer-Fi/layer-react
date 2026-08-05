import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'

import { type CatalogService } from '@schemas/features/timeTracking/catalogService'
import { useSizeClass } from '@hooks/utils/size/useWindowSize'
import { usePostReactivateCatalogService } from '@api/businesses/[business-id]/catalog/services/[service-id]/reactivate/post'
import { BaseConfirmationModal } from '@blocks/BaseConfirmationModal/BaseConfirmationModal'

type ServiceRestoreConfirmationModalProps = {
  service: CatalogService | null
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function ServiceRestoreConfirmationModal({
  service,
  isOpen,
  onOpenChange,
  onSuccess,
}: ServiceRestoreConfirmationModalProps) {
  const { t } = useTranslation()
  const { isMobile } = useSizeClass()
  const { trigger: reactivateService } = usePostReactivateCatalogService({ serviceId: service?.id ?? '' })

  const onConfirm = useCallback(async () => {
    if (!service) {
      return
    }
    await reactivateService()
    onSuccess()
  }, [onSuccess, reactivateService, service])

  return (
    <BaseConfirmationModal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      onConfirm={onConfirm}
      title={t('timeTracking:ServiceRestoreConfirmationModal.services.unarchive_confirm_title', 'Restore this service?')}
      description={t('timeTracking:ServiceRestoreConfirmationModal.services.unarchive_confirm_description', 'This service will appear in your active list again.')}
      confirmLabel={t('timeTracking:ServiceRestoreConfirmationModal.services.unarchive', 'Restore')}
      errorText={t('timeTracking:ServiceRestoreConfirmationModal.error.unarchive_service', 'Could not restore this service. Please try again.')}
      useDrawer={isMobile}
    />
  )
}
