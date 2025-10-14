import { ReactNode } from 'react'
import { BaseConfirmationModal } from '../BaseConfirmationModal/BaseConfirmationModal'
import { Span } from '../ui/Typography/Text'
import { VStack } from '../ui/Stack/Stack'
import { capitalizeFirstLetter } from './utils'

interface BulkActionsConfirmationModalProps {
  isOpen: boolean
  onOpenChange?: (isOpen: boolean) => void
  itemCount: number
  actionLabel: string
  itemLabel: string
  descriptionLabel?: string
  onConfirm: () => void | Promise<void>
  confirmLabel: string
  cancelLabel: string
  confirmDisabled?: boolean
  hideDescription?: boolean
  children?: ReactNode
}

export const BulkActionsConfirmationModal = ({
  isOpen,
  onOpenChange,
  itemCount,
  actionLabel,
  itemLabel,
  descriptionLabel,
  onConfirm,
  confirmLabel,
  cancelLabel,
  confirmDisabled,
  hideDescription = false,
  children,
}: BulkActionsConfirmationModalProps) => {
  return (
    <BaseConfirmationModal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      title={`${capitalizeFirstLetter(actionLabel)} all selected ${itemLabel}?`}
      content={(
        <VStack gap='xs'>
          {children}
          {!hideDescription && (
            <Span>
              {`This action will ${actionLabel} ${itemCount} selected ${itemLabel}${descriptionLabel}.`}
            </Span>
          )}
        </VStack>
      )}
      onConfirm={onConfirm}
      confirmLabel={confirmLabel}
      cancelLabel={cancelLabel}
      confirmDisabled={confirmDisabled}
      closeOnConfirm
    />
  )
}
