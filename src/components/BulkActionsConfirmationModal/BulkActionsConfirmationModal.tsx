import { BaseConfirmationModal } from '../BaseConfirmationModal/BaseConfirmationModal'
import { Span } from '../ui/Typography/Text'
import { capitalizeFirstLetter } from './utils'

interface BulkActionsConfirmationModalProps {
  isOpen: boolean
  onOpenChange?: (isOpen: boolean) => void
  itemCount: number
  actionLabel: string
  itemLabel: string
  onConfirm: () => void | Promise<void>
  confirmLabel: string
  cancelLabel: string
}

export const BulkActionsConfirmationModal = ({
  isOpen,
  onOpenChange,
  itemCount,
  actionLabel,
  itemLabel,
  onConfirm,
  confirmLabel,
  cancelLabel,
}: BulkActionsConfirmationModalProps) => {
  return (
    <BaseConfirmationModal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      title={`${capitalizeFirstLetter(actionLabel)} all selected ${itemLabel}?`}
      content={(
        <Span>
          {`This will ${actionLabel} ${itemCount} selected ${itemLabel}.`}
        </Span>
      )}
      onConfirm={onConfirm}
      confirmLabel={confirmLabel}
      cancelLabel={cancelLabel}
      closeOnConfirm
    />
  )
}
