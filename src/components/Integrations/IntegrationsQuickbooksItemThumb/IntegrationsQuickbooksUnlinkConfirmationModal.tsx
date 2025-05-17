import { Modal, ModalProps } from '../../ui/Modal/Modal'
import { ModalContextBar, ModalHeading, ModalActions, ModalContent } from '../../ui/Modal/ModalSlots'
import { Button, ButtonVariant } from '../../Button/Button'
import { HStack, Spacer } from '../../ui/Stack/Stack'
import { P } from '../../ui/Typography/Text'
import { useCallback, useContext, useState } from 'react'
import { RetryButton } from '../../Button'
import { QuickbooksContext } from '../../../contexts/QuickbooksContext/QuickbooksContext'

function IntegrationsQuickbooksUnlinkConfirmationModalContent({ onClose }: { onClose: () => void }) {
  const { unlinkQuickbooks } = useContext(QuickbooksContext)

  const [isProcessing, setIsProcessing] = useState(false)
  const [hasFailed, setHasFailed] = useState(false)

  const unlinkErrorText = 'Unlink failed. Check connection and retry in few seconds.'
  const onClickUnlinkQuickbooks = useCallback(() => {
    setIsProcessing(true)
    unlinkQuickbooks()
    .then(() => {
      onClose()
    })
    .catch(() => {
      setHasFailed(true)
      setIsProcessing(false)
    })
  }, [unlinkQuickbooks, onClose])

  return (
    <>
      <ModalContextBar onClose={onClose} />
      <ModalHeading pbe='2xs'>
        Unlink QuickBooks
      </ModalHeading>
      <ModalContent>
        <P>Please confirm that you want to unlink QuickBooks.</P>
      </ModalContent>
      <ModalActions>
        <HStack gap='md'>
          <Spacer />
          <Button variant={ButtonVariant.secondary} onClick={onClose}>
            Cancel
          </Button>
          {!hasFailed && (
            <Button variant={ButtonVariant.primary} onClick={onClickUnlinkQuickbooks} isProcessing={isProcessing}>
              Unlink QuickBooks
            </Button>
          )}
          {hasFailed && (
            <RetryButton onClick={onClickUnlinkQuickbooks} processing={isProcessing} error={unlinkErrorText}>
              Retry Unlink QuickBooks
            </RetryButton>
          )}
        </HStack>
      </ModalActions>
    </>
  )
}

type IntegrationsQuickbooksUnlinkConfirmationModalProps = Pick<ModalProps, 'isOpen' | 'onOpenChange'>
export function IntegrationsQuickbooksUnlinkConfirmationModal({ isOpen, onOpenChange }: IntegrationsQuickbooksUnlinkConfirmationModalProps) {
  return (
    <Modal flexBlock isOpen={isOpen} onOpenChange={onOpenChange}>
      {({ close }) => <IntegrationsQuickbooksUnlinkConfirmationModalContent onClose={close} />}
    </Modal>
  )
}
