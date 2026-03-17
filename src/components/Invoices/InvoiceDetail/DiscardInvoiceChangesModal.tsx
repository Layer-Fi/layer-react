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
      title={t('invoices:prompt.discard_changes_invoice', 'Discard changes to this invoice?')}
      description={t('common:label.unsaved_changes_lost', 'Any unsaved changes will be lost.')}
      onConfirm={onConfirm}
      confirmLabel={t('common:action.discard_changes', 'Discard changes')}
      cancelLabel={t('common:label.keep_editing', 'Keep editing')}
    />
  )
}
