import { ReactNode } from 'react'
import { BaseConfirmationModal } from '../BaseConfirmationModal/BaseConfirmationModal'
import { Span } from '../ui/Typography/Text'
import { VStack } from '../ui/Stack/Stack'
import _ from 'lodash'

interface BulkActionsConfirmationModalProps {
  isOpen: boolean
  itemCount: number
  actionLabel: string
  itemLabel: string
  descriptionLabel?: string
  confirmLabel: string
  cancelLabel: string
  confirmDisabled?: boolean
  hideDescription?: boolean
  onOpenChange?: (isOpen: boolean) => void
  onConfirm: () => void | Promise<void>
  children?: ReactNode
}

export const BulkActionsConfirmationModal = ({
  isOpen,
  onOpenChange,
  itemCount,
  actionLabel,
  itemLabel,
  descriptionLabel = '',
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
      title={`${_.capitalize(actionLabel)} all selected ${itemLabel}?`}
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
