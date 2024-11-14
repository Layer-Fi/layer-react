import React, { useState } from 'react'
import { Modal } from '../../ui/Modal/Modal'
import { ModalContextBar, ModalHeading, ModalActions, ModalContent, ModalDescription } from '../../ui/Modal/ModalSlots'
import useSWRMutation from 'swr/mutation'

import { Button } from '../../ui/Button/Button'
import { VStack } from '../../ui/Stack/Stack'
import { useLinkedAccounts } from '../../../hooks/useLinkedAccounts'
import { useAccountConfirmationStore } from '../../../providers/AccountConfirmationStoreProvider'
import { getAccountsNeedingConfirmation } from '../../../hooks/useLinkedAccounts/useLinkedAccounts'
import { ConditionalList } from '../../utility/ConditionalList'
import { LinkedAccountToConfirm } from './LinkedAccountToConfirm'
import { useLayerContext } from '../../../contexts/LayerContext'
import { Layer } from '../../../api/layer'
import type { Awaitable } from '../../../types/utility/promises'
import { P } from '../../ui/Typography/Text'

type AccountConfirmDenyFormState = Record<string, boolean>

function useConfirmAndDenyMultiple(
  formState: AccountConfirmDenyFormState,
  { onSuccess }: { onSuccess: () => Awaitable<unknown> }
) {
  const { apiUrl, auth, businessId } = useLayerContext()

  const deny = (accountId: string) => {
    return Layer.excludeAccount(
      apiUrl,
      auth?.access_token,
      {
        params: {
          businessId,
          accountId,
        },
        body: {
          is_irrelevant: true,
        }
      }
    )
  }
  const confirm = (accountId: string) => {
    return Layer.confirmAccount(
      apiUrl,
      auth?.access_token,
      {
        params: {
          businessId,
          accountId,
        },
        body: {
          is_relevant: true,
        }
      }
    )
  }

  return useSWRMutation(
    `/v1/businesses/${businessId}/external-accounts/bulk`,
    () => Promise.all(
      Object.entries(formState).map(([ accountId, isConfirmed ]) =>
        isConfirmed ? confirm(accountId) : deny(accountId)
      )
    )
      .then(() => onSuccess())
      .then(() => true as const),
    {
      revalidate: false,
      throwOnError: false,
    }
  )
}

function getButtonLabel(
  { totalCount, confirmedCount }: { totalCount: number, confirmedCount: number }
) {
  if (confirmedCount === totalCount) {
    return totalCount > 1
      ? 'Confirm All Accounts'
      : 'Confirm Account'
  }

  if (confirmedCount === 0) {
    return totalCount > 1
      ? 'Deny All Accounts'
      : 'Deny Account'
  }

  return `Confirm ${confirmedCount} Selected Account${confirmedCount > 1 ? 's' : ''}`
}

function getFormComponentLabels(formState: AccountConfirmDenyFormState) {
  const values = Object.values(formState)

  const totalCount = values.length
  const confirmedCount = values.filter(Boolean).length

  const buttonLabel = getButtonLabel({ totalCount, confirmedCount })
  const descriptionLabel = `${totalCount > 1 ? 'Are any of' : 'Is'} the following account${totalCount > 1 ? 's' : ''} relevant to your business?`

  return {
    buttonLabel,
    descriptionLabel
  }
}

function useLinkedAccountsConfirmationModal() {
  const { data, refetchAccounts } = useLinkedAccounts()
  const accountsNeedingConfirmation = getAccountsNeedingConfirmation(data ?? [])

  const {
    isDismissed,
    actions: { dismiss: dismissAccountConfirmation }
  } = useAccountConfirmationStore()

  return {
    isOpen: !isDismissed && accountsNeedingConfirmation.length > 0,
    accounts: accountsNeedingConfirmation,
    onDismiss: dismissAccountConfirmation,
    refetchAccounts,
  }
}

function LinkedAccountsConfirmationModalContent({ onClose }: { onClose: () => void }) {
  const { accounts, onDismiss, refetchAccounts } = useLinkedAccountsConfirmationModal()

  const [ formState, setFormState ] = useState(() => Object.fromEntries(
    accounts.map(({ id }) => [ id, true ])
  ))

  const { trigger, isMutating, error } = useConfirmAndDenyMultiple(formState, {
    onSuccess: refetchAccounts
  })
  const hasError = Boolean(error)

  const handleDismiss = () => {
    onDismiss()
    onClose()
  }

  const handleFinish = async () => {
    const success = await trigger()
    if (success) {
      onClose()
    }
  }

  const { descriptionLabel, buttonLabel } = getFormComponentLabels(formState)

  return (
    <>
      <ModalContextBar onClose={handleDismiss} />
      <ModalHeading pbe='2xs'>
        Confirm Accounts
      </ModalHeading>
      <ModalDescription pbe='md'>
        {descriptionLabel}
      </ModalDescription>
      <ModalContent>
        <ConditionalList
          list={accounts}
          Empty={
            <P slot='center'>
              There are no accounts to confirm. You may close this modal.
            </P>
          }
          Container={({ children }) => <VStack gap='md'>{children}</VStack>}
        >
          {({ item }) =>
            <LinkedAccountToConfirm
              key={item.id}
              account={item}
              isConfirmed={formState[item.id] ?? false}
              onChangeConfirmed={
                (isConfirmed) => setFormState((currentState) => ({
                  ...currentState,
                  [item.id]: isConfirmed
                }))
              }
            />
          }
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
                <Button size='lg' onPress={handleDismiss}>
                  Close
                </Button>
              </>
            )
            : (
              <Button size='lg' onPress={handleFinish} isPending={isMutating}>
                {buttonLabel}
              </Button>
            )
          }
        </VStack>
      </ModalActions>
    </>
  )
}

export function LinkedAccountsConfirmationModal() {
  const { isOpen, onDismiss } = useLinkedAccountsConfirmationModal()

  return (
    <Modal isOpen={isOpen} onOpenChange={(isOpen) => {
      if (!isOpen) {
        onDismiss()
      }
    }}>
      {({ close }) => <LinkedAccountsConfirmationModalContent onClose={close} />}
    </Modal>
  )
}
