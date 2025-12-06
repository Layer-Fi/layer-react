import { useContext } from 'react'

import { QuickbooksContext } from '@contexts/QuickbooksContext/QuickbooksContext'
import { BaseConfirmationModal } from '@components/blocks/BaseConfirmationModal/BaseConfirmationModal/BaseConfirmationModal'
import { type ModalProps } from '@ui/Modal/Modal'

type IntegrationsQuickbooksUnlinkConfirmationModalProps = Pick<ModalProps, 'isOpen' | 'onOpenChange'>
export function IntegrationsQuickbooksUnlinkConfirmationModal({ isOpen, onOpenChange }: IntegrationsQuickbooksUnlinkConfirmationModalProps) {
  const { unlinkQuickbooks } = useContext(QuickbooksContext)

  return (
    <BaseConfirmationModal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      title='Unlink QuickBooks'
      description='Please confirm that you want to unlink QuickBooks.'
      onConfirm={unlinkQuickbooks}
      confirmLabel='Unlink QuickBooks'
      errorText='Unlink failed. Please check your connection and try again in a few seconds.'
    />
  )
}
