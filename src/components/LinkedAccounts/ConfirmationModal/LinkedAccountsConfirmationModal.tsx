import { useState } from 'react'
import { Modal } from '../../ui/Modal/Modal'
import { ModalHeading, ModalActions, ModalContent, ModalDescription, ModalTitleWithClose } from '../../ui/Modal/ModalSlots'
import { Button } from '../../ui/Button/Button'
import { VStack } from '../../ui/Stack/Stack'
import { useLinkedAccounts } from '../../../hooks/useLinkedAccounts'
import { useAccountConfirmationStore } from '../../../providers/AccountConfirmationStoreProvider'
import { getAccountsNeedingConfirmation } from '../../../hooks/useLinkedAccounts/useLinkedAccounts'
import { ConditionalList } from '../../utility/ConditionalList'
import { LinkedAccountToConfirm } from './LinkedAccountToConfirm'
import { P } from '../../ui/Typography/Text'
import { LoadingSpinner } from '../../ui/Loading/LoadingSpinner'
import { useConfirmAndExcludeMultiple, AccountConfirmExcludeFormState } from './useConfirmAndExcludeMultiple'

function getButtonLabel(
  { totalCount, confirmedCount }: { totalCount: number, confirmedCount: number },
) {
  if (confirmedCount === totalCount) {
    return totalCount > 1
      ? 'Confirm All Accounts'
      : 'Confirm Account'
  }

  if (confirmedCount === 0) {
    return totalCount > 1
      ? 'Exclude All Accounts'
      : 'Exclude Account'
  }

  return `Confirm ${confirmedCount} Selected Account${confirmedCount > 1 ? 's' : ''}`
}

function getFormComponentLabels(formState: AccountConfirmExcludeFormState) {
  const values = Object.values(formState)

  const totalCount = values.length
  const confirmedCount = values.filter(Boolean).length

  const buttonLabel = getButtonLabel({ totalCount, confirmedCount })
  const descriptionLabel = totalCount > 1
    ? 'Select the accounts you use for your business.'
    : 'Is this account relevant to your business?'

  return {
    buttonLabel,
    descriptionLabel,
  }
}

function useLinkedAccountsConfirmationModal() {
  const { data, refetchAccounts } = useLinkedAccounts()
  const accountsNeedingConfirmation = getAccountsNeedingConfirmation(data ?? [])

  const {
    visibility,
    actions: { dismiss: dismissAccountConfirmation, reset: resetAccountConfirmation },
  } = useAccountConfirmationStore()

  const isDismissed = visibility === 'DISMISSED'
  const preloadIsOpen = !isDismissed && visibility === 'PRELOADED'
  const mainIsOpen = !isDismissed && accountsNeedingConfirmation.length > 0

  const baseInfo = {
    accounts: accountsNeedingConfirmation,
    onDismiss: dismissAccountConfirmation,
    onFinish: resetAccountConfirmation,
    refetchAccounts,
  }

  if (mainIsOpen) {
    return {
      preloadIsOpen: false,
      mainIsOpen: true,
      ...baseInfo,
    } as const
  }

  if (preloadIsOpen) {
    return {
      preloadIsOpen: true,
      mainIsOpen: false,
      ...baseInfo,
    } as const
  }

  return {
    preloadIsOpen: false,
    mainIsOpen: false,
    ...baseInfo,
  } as const
}

function LinkedAccountsConfirmationModalPreloadedContent({ onClose }: { onClose: () => void }) {
  return (
    <VStack gap='2xs'>
      <ModalTitleWithClose
        heading={(
          <ModalHeading size='xl'>
            Loading Your Accounts...
          </ModalHeading>
        )}
        onClose={onClose}
      />
      <ModalContent>
        <VStack slot='center' align='center' gap='md'>
          <LoadingSpinner size={48} />
          <P align='center'>
            This may take a few minutes.
          </P>
        </VStack>
      </ModalContent>
    </VStack>
  )
}

function LinkedAccountsConfirmationModalContent({ onClose }: { onClose: () => void }) {
  const { accounts, onFinish, refetchAccounts } = useLinkedAccountsConfirmationModal()

  const [formState, setFormState] = useState(() => Object.fromEntries(
    accounts.map(({ id }) => [id, true]),
  ))

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const { trigger, isMutating, error } = useConfirmAndExcludeMultiple({ onSuccess: refetchAccounts })
  const hasError = Boolean(error)

  const handleFinish = async () => {
    const success = await trigger(formState)
    if (success) {
      onFinish()
      onClose()
    }
  }

  const { descriptionLabel, buttonLabel } = getFormComponentLabels(formState)

  return (
    <>
      <ModalTitleWithClose
        heading={(
          <ModalHeading pbe='2xs' size='xl'>
            Confirm Business Accounts
          </ModalHeading>
        )}
        onClose={onClose}
      />
      <ModalDescription pbe='md'>
        {descriptionLabel}
      </ModalDescription>
      <ModalContent>
        <ConditionalList
          list={accounts}
          Empty={(
            <VStack slot='center'>
              <P align='center'>
                There are no accounts to confirm. You may close this modal.
              </P>
            </VStack>
          )}
          Container={({ children }) => <VStack gap='md'>{children}</VStack>}
        >
          {({ item }) => (
            <LinkedAccountToConfirm
              key={item.id}
              account={item}
              isConfirmed={formState[item.id] ?? false}
              onChangeConfirmed={
                isConfirmed => setFormState(currentState => ({
                  ...currentState,
                  [item.id]: isConfirmed,
                }))
              }
            />
          )}
        </ConditionalList>
      </ModalContent>
      <ModalActions>
        <VStack gap='md'>
          {hasError
            ? (
              <>
                <P size='sm'>
                  An error occurred while confirming accounts.
                  You will have an opportunity to try again later.
                </P>
                <P size='sm'>
                  No data will be synced until you confirm.
                </P>
                <Button onPress={close}>
                  Close
                </Button>
              </>
            )
            : (
              <Button onPress={() => { void handleFinish() }} isPending={isMutating}>
                {buttonLabel}
              </Button>
            )}
        </VStack>
      </ModalActions>
    </>
  )
}

export function LinkedAccountsConfirmationModal() {
  const { preloadIsOpen, mainIsOpen, onDismiss } = useLinkedAccountsConfirmationModal()

  return (
    <Modal
      isOpen={preloadIsOpen || mainIsOpen}
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          onDismiss()
        }
      }}
    >
      {({ close }) =>
        preloadIsOpen
          ? <LinkedAccountsConfirmationModalPreloadedContent onClose={close} />
          : <LinkedAccountsConfirmationModalContent onClose={close} />}
    </Modal>
  )
}
