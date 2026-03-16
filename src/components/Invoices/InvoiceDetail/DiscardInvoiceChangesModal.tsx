import { useTranslation } from 'react-i18next'

import { BaseConfirmationModal } from '@blocks/BaseConfirmationModal/BaseConfirmationModal'

export type DiscardInvoiceChangesModalProps = {
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
  onConfirm: () => void
}

export const DiscardInvoiceChangesModal = ({
  isOpen,
  onOpenChange,
  onConfirm,
}: DiscardInvoiceChangesModalProps) => {
  const { t } = useTranslation()
  return (
    <BaseConfirmationModal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      title={t('invoices:discardChangesToThisInvoice', 'Discard changes to this invoice?')}
      description={t('common:anyUnsavedChangesWillBeLost', 'Any unsaved changes will be lost.')}
      onConfirm={onConfirm}
      confirmLabel={t('common:discardChanges', 'Discard changes')}
      cancelLabel={t('common:keepEditing', 'Keep editing')}
    />
  )
}
