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
      title={t('unlinkQuickbooks', 'Unlink QuickBooks')}
      description={t('pleaseConfirmThatYouWantToUnlinkQuickbooks', 'Please confirm that you want to unlink QuickBooks.')}
      onConfirm={unlinkQuickbooks}
      confirmLabel={t('unlinkQuickbooks', 'Unlink QuickBooks')}
      errorText={t('unlinkFailedTryAgain', 'Unlink failed. Please check your connection and try again in a few seconds.')}
    />
  )
}
