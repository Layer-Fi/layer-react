import { memo, type ReactNode, useCallback, useState } from 'react'

import { type Awaitable } from '@internal-types/utility/promises'
import { APIError } from '@models/APIError'
import { Drawer, Modal, type ModalProps } from '@ui/Modal/Modal'
import {
  ModalActions,
  ModalContent,
  ModalDescription,
  ModalHeading,
  ModalTitleWithClose,
} from '@ui/Modal/ModalSlots'
import { HStack, Spacer, VStack } from '@ui/Stack/Stack'
import { Button, ButtonVariant } from '@components/Button/Button'
import { SubmitButton } from '@components/Button/SubmitButton'

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
  useDrawer?: boolean
}

function getErrorMessage(error: APIError | Error | null, errorText?: string) {
  if (error === null) return null

  if (errorText) return errorText

  return error instanceof APIError
    ? error?.getAllMessages()?.[0] || error?.getMessage()
    : error?.message
}

type BaseConfirmationModalContentProps = Omit<
  BaseConfirmationModalProps,
  'isOpen' | 'onOpenChange'
> & {
  close: () => void
}

const BaseConfirmationModalContent = memo(function BaseConfirmationModalContent({
  close,
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
  useDrawer = false,
}: BaseConfirmationModalContentProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<APIError | Error | null>(null)

  const onClickConfirm = useCallback(() => {
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
  }, [closeOnConfirm, onConfirm, close])

  return (
    <VStack
      pi={useDrawer ? 'lg' : undefined}
      pb={useDrawer ? 'lg' : undefined}
    >
      <ModalTitleWithClose
        heading={(
          <ModalHeading size='sm'>
            {title}
          </ModalHeading>
        )}
        onClose={close}
        hideCloseButton={useDrawer}
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
            onClick={onClickConfirm}
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
  )
})

export function BaseConfirmationModal({
  isOpen,
  onOpenChange,
  useDrawer = false,
  ...contentProps
}: BaseConfirmationModalProps) {
  if (useDrawer) {
    return (
      <Drawer
        flexBlock
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        variant='mobile-drawer'
        isDismissable
        role='alertdialog'
      >
        {({ close }) => (
          <BaseConfirmationModalContent
            {...contentProps}
            useDrawer
            close={close}
          />
        )}
      </Drawer>
    )
  }

  return (
    <Modal flexBlock isOpen={isOpen} onOpenChange={onOpenChange} role='alertdialog'>
      {({ close }) => (
        <BaseConfirmationModalContent
          {...contentProps}
          close={close}
        />
      )}
    </Modal>
  )
}
