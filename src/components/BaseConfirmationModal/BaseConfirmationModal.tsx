// BaseConfirmationModal.tsx
import { Modal, ModalProps } from '../ui/Modal/Modal'
import {
  ModalHeading,
  ModalActions,
  ModalCloseButton,
  ModalDescription,
} from '../ui/Modal/ModalSlots'
import { Button, ButtonVariant } from '../Button/Button'
import { HStack, Spacer } from '../ui/Stack/Stack'
import { useCallback, useState } from 'react'
import { SubmitButton } from '../Button'
import { Awaitable } from '../../types/utility/promises'
import { APIError } from '../../models/APIError'

export type BaseConfirmationModalProps = Pick<ModalProps, 'isOpen' | 'onOpenChange'> & {
  title: string
  description: string
  onConfirm: () => Awaitable<void>
  confirmLabel?: string
  retryLabel?: string
  cancelLabel?: string
  errorText?: string
}

export function BaseConfirmationModal({
  isOpen,
  onOpenChange,
  title,
  description,
  onConfirm,
  confirmLabel = 'Confirm',
  retryLabel = 'Retry',
  cancelLabel = 'Cancel',
  errorText,
}: BaseConfirmationModalProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<APIError | Error | null>(null)

  const onClickConfirm = useCallback((close: () => void) => {
    setIsProcessing(true)
    void Promise.resolve(onConfirm())
      .then(() => {
        close()
      })
      .catch((e: APIError | Error) => {
        setError(e)
        setIsProcessing(false)
      })
  }, [onConfirm])

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
        <>
          <HStack justify='space-between' align='start'>
            <ModalHeading pbe='2xs'>{title}</ModalHeading>
            <ModalCloseButton />
          </HStack>
          <ModalDescription>{description}</ModalDescription>
          <ModalActions>
            <HStack gap='md'>
              <Spacer />
              <Button variant={ButtonVariant.secondary} onClick={close}>
                {cancelLabel}
              </Button>
              <SubmitButton
                onClick={() => onClickConfirm(close)}
                processing={isProcessing}
                error={getErrorMessage(error, errorText) ?? ''}
                withRetry
                noIcon={!isProcessing}
              >
                {error ? retryLabel : confirmLabel}
              </SubmitButton>
            </HStack>
          </ModalActions>
        </>
      )}
    </Modal>
  )
}
