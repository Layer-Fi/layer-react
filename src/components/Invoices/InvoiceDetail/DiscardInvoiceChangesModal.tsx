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
  return (
    <BaseConfirmationModal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      title='Discard changes to this invoice?'
      description='Any unsaved changes will be lost.'
      onConfirm={onConfirm}
      confirmLabel='Discard changes'
      cancelLabel='Keep editing'
    />
  )
}
