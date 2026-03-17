import { useContext } from 'react'
import { useTranslation } from 'react-i18next'

import { QuickbooksContext } from '@contexts/QuickbooksContext/QuickbooksContext'
import { type ModalProps } from '@ui/Modal/Modal'
import { BaseConfirmationModal } from '@blocks/BaseConfirmationModal/BaseConfirmationModal'

type IntegrationsQuickbooksUnlinkConfirmationModalProps = Pick<ModalProps, 'isOpen' | 'onOpenChange'>
export function IntegrationsQuickbooksUnlinkConfirmationModal({ isOpen, onOpenChange }: IntegrationsQuickbooksUnlinkConfirmationModalProps) {
  const { t } = useTranslation()
  const { unlinkQuickbooks } = useContext(QuickbooksContext)

  return (
    <BaseConfirmationModal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      title={t('integrations:label.unlink_quickbooks', 'Unlink QuickBooks')}
      description={t('integrations:prompt.confirm_unlink_quickbooks', 'Please confirm that you want to unlink QuickBooks.')}
      onConfirm={unlinkQuickbooks}
      confirmLabel={t('integrations:action.unlink_quickbooks', 'Unlink QuickBooks')}
      errorText={t('integrations:error.unlink_failed', 'Unlink failed. Please check your connection and try again in a few seconds.')}
    />
  )
}
