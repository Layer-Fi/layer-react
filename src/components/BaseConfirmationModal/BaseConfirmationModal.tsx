import { SubmitButton } from '@components/Button/SubmitButton'
import { Button, ButtonVariant } from '@components/Button/Button'
import { Modal, ModalProps } from '@ui/Modal/Modal'
import {
  ModalHeading,
  ModalActions,
  ModalDescription,
  ModalTitleWithClose,
  ModalContent,
} from '@ui/Modal/ModalSlots'
import { HStack, Spacer, VStack } from '@ui/Stack/Stack'
import { useCallback, useState, type ReactNode } from 'react'
import { Awaitable } from '@internal-types/utility/promises'
import { APIError } from '../../models/APIError'

export type BaseConfirmationModalProps = Pick<ModalProps, 'isOpen' | 'onOpenChange'> & {
  title: string
  description?: string
  content?: ReactNode
  onConfirm: () => Awaitable<void>
  confirmLabel?: string
  retryLabel?: string
  cancelLabel?: string
  errorText?: string
  closeOnConfirm?: boolean
  confirmDisabled?: boolean
}

export function BaseConfirmationModal({
  isOpen,
  onOpenChange,
  title,
  description,
  content,
  onConfirm,
  confirmLabel = 'Confirm',
  retryLabel = 'Retry',
  cancelLabel = 'Cancel',
  errorText,
  closeOnConfirm = true,
  confirmDisabled = false,
}: BaseConfirmationModalProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<APIError | Error | null>(null)

  const onClickConfirm = useCallback((close: () => void) => {
    setIsProcessing(true)
    void Promise.resolve(onConfirm())
      .then(() => {
        if (closeOnConfirm) close()
      })
      .catch((e: APIError | Error) => {
        setError(e)
      })
      .finally(() => {
        setIsProcessing(false)
      })
  }, [closeOnConfirm, onConfirm])

  const getErrorMessage = (error: APIError | Error | null, errorText?: string) => {
    if (error === null) return null

    if (errorText) return errorText

    return error instanceof APIError
      ? error?.getAllMessages()?.[0] || error?.getMessage()
      : error?.message
  }

  return (
    <Modal flexBlock isOpen={isOpen} onOpenChange={onOpenChange} role='alertdialog'>
      {({ close }) => (
        <VStack>
          <ModalTitleWithClose
            heading={(
              <ModalHeading size='sm'>
                {title}
              </ModalHeading>
            )}
            onClose={close}
          />
          <VStack gap='md'>
            {description && <ModalDescription>{description}</ModalDescription>}
            {content && <ModalContent>{content}</ModalContent>}
          </VStack>
          <ModalActions>
            <HStack gap='md'>
              <Spacer />
              <Button variant={ButtonVariant.secondary} onClick={close}>
                {cancelLabel}
              </Button>
              <SubmitButton
                onClick={() => onClickConfirm(close)}
                processing={isProcessing}
                disabled={confirmDisabled}
                error={getErrorMessage(error, errorText) ?? ''}
                withRetry
                noIcon={!isProcessing}
              >
                {error ? retryLabel : confirmLabel}
              </SubmitButton>
            </HStack>
          </ModalActions>
        </VStack>
      )}
    </Modal>
  )
}
