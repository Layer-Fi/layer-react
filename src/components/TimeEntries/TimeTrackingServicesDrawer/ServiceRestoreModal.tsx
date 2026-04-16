import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'

import { type CatalogService } from '@schemas/catalogService'
import { useReactivateCatalogService } from '@hooks/api/businesses/[business-id]/catalog/services/[service-id]/useReactivateCatalogService'
import { useSizeClass } from '@hooks/utils/size/useWindowSize'
import { BaseConfirmationModal } from '@components/blocks/BaseConfirmationModal/BaseConfirmationModal'

type ServiceRestoreModalProps = {
  service: CatalogService
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function ServiceRestoreModal({
  service,
  isOpen,
  onOpenChange,
  onSuccess,
}: ServiceRestoreModalProps) {
  const { t } = useTranslation()
  const { isMobile } = useSizeClass()
  const { trigger: reactivateService } = useReactivateCatalogService({ serviceId: service.id })

  const onConfirm = useCallback(async () => {
    await reactivateService()
    onSuccess()
  }, [onSuccess, reactivateService])

  return (
    <BaseConfirmationModal
      isOpen={isOpen}
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
