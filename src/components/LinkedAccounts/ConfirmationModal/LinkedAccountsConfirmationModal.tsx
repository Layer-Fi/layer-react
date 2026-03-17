import { useState } from 'react'
import type { TFunction } from 'i18next'
import { useTranslation } from 'react-i18next'

import { tPlural } from '@utils/i18n/plural'
import { type AccountConfirmExcludeFormState, useConfirmAndExcludeMultiple } from '@hooks/features/bankAccounts/useConfirmAndExcludeMultiple'
import { getAccountsNeedingConfirmation, useLinkedAccounts } from '@hooks/legacy/useLinkedAccounts'
import { useAccountConfirmationStore } from '@providers/AccountConfirmationStoreProvider'
import { Button } from '@ui/Button/Button'
import { LoadingSpinner } from '@ui/Loading/LoadingSpinner'
import { Modal } from '@ui/Modal/Modal'
import { ModalActions, ModalContent, ModalDescription, ModalHeading, ModalTitleWithClose } from '@ui/Modal/ModalSlots'
import { VStack } from '@ui/Stack/Stack'
import { P } from '@ui/Typography/Text'
import { LinkedAccountToConfirm } from '@components/LinkedAccounts/ConfirmationModal/LinkedAccountToConfirm'
import { ConditionalList } from '@components/utility/ConditionalList'

function getButtonLabel(
  { totalCount, confirmedCount }: { totalCount: number, confirmedCount: number },
  t: TFunction,
) {
  if (confirmedCount === totalCount) {
    return tPlural(t, 'linkedAccounts:action.confirm_accounts', {
      count: totalCount,
      one: 'Confirm Account',
      other: 'Confirm All Accounts',
    })
  }

  if (confirmedCount === 0) {
    return tPlural(t, 'linkedAccounts:action.exclude_all_accounts', {
      count: totalCount,
      one: 'Exclude Account',
      other: 'Exclude All Accounts',
    })
  }

  return tPlural(t, 'linkedAccounts:action.confirm_accounts_selected', {
    count: confirmedCount,
    one: 'Confirm {{count}} Selected Account',
    other: 'Confirm {{count}} Selected Accounts',
  })
}

function getFormComponentLabels(
  formState: AccountConfirmExcludeFormState,
  t: TFunction,
) {
  const values = Object.values(formState)

  const totalCount = values.length
  const confirmedCount = values.filter(Boolean).length

  const buttonLabel = getButtonLabel({ totalCount, confirmedCount }, t)
  const descriptionLabel = tPlural(t, 'linkedAccounts:label.select_accounts_use', {
    count: totalCount,
    one: 'Is this account relevant to your business?',
    other: 'Select the accounts you use for your business.',
  })

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
  const { t } = useTranslation()
  return (
    <VStack gap='2xs'>
      <ModalTitleWithClose
        heading={(
          <ModalHeading size='md'>
            {t('linkedAccounts:label.loading_accounts', 'Loading Your Accounts...')}
          </ModalHeading>
        )}
        onClose={onClose}
      />
      <ModalContent>
        <VStack slot='center' align='center' gap='md'>
          <LoadingSpinner size={48} />
          <P align='center'>
            {t('linkedAccounts:label.may_take_few_minutes', 'This may take a few minutes.')}
          </P>
        </VStack>
      </ModalContent>
    </VStack>
  )
}

function LinkedAccountsConfirmationModalContent({ onClose }: { onClose: () => void }) {
  const { t } = useTranslation()
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

  const { descriptionLabel, buttonLabel } = getFormComponentLabels(formState, t)

  return (
    <>
      <ModalTitleWithClose
        heading={(
          <ModalHeading pbe='2xs' size='md'>
            {t('linkedAccounts:label.confirm_business_accounts', 'Confirm Business Accounts')}
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
                {t('linkedAccounts:label.no_accounts_to_confirm', 'There are no accounts to confirm. You may close this modal.')}
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
                  {t('linkedAccounts:error.confirm_accounts_try_again_later', 'An error occurred while confirming accounts. You will have an opportunity to try again later.')}
                </P>
                <P size='sm'>
                  {t('linkedAccounts:label.no_data_sync_until_confirm', 'No data will be synced until you confirm.')}
                </P>
                <Button onPress={onClose}>
                  {t('common:action.close_label', 'Close')}
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
