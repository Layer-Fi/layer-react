import React, { useContext, useEffect, useRef, useState } from 'react'
import { Modal } from '../../ui/Modal/Modal'
import { ModalContextBar, ModalHeading, ModalActions, ModalContent, ModalDescription } from '../../ui/Modal/ModalSlots'
import { Button } from '../../ui/Button/Button'
import { VStack } from '../../ui/Stack/Stack'
import { useLinkedAccounts } from '../../../hooks/useLinkedAccounts'
import { ConditionalList } from '../../utility/ConditionalList'
import { useLayerContext } from '../../../contexts/LayerContext'
import { LinkedAccount } from '../../../types/linked_accounts'
import { Text, TextSize } from '../../Typography/Text'
import { getActivationDate } from '../../../utils/business'
import { AccountFormBox, AccountFormBoxData, AccountFormBoxRef } from '../AccountFormBox/AccountFormBox'
import { useUpdateOpeningBalanceAndDate } from './useUpdateOpeningBalanceAndDate'
import { convertToCents } from '../../../utils/format'
import { LinkedAccountsContext } from '../../../contexts/LinkedAccountsContext'

type OpeningBalanceModalStringOverrides = {
  title?: string
  description?: string
  buttonText?: string
}

function LinkedAccountsOpeningBalanceModalContent({
  onClose,
  accounts,
  stringOverrides,
}: {
  onClose: () => void
  accounts: LinkedAccount[]
  stringOverrides?: OpeningBalanceModalStringOverrides
}) {
  const { business } = useLayerContext()
  const { refetchAccounts } = useLinkedAccounts()

  const childRefs = useRef<AccountFormBoxRef[]>([])

  const [formState, setFormState] = useState<AccountFormBoxData[]>([])

  const {
    trigger,
    isMutating,
    error: hasError,
  } = useUpdateOpeningBalanceAndDate(formState, {
    onSuccess: refetchAccounts,
  })

  useEffect(() => {
    if (formState.length > 0) {
      saveData()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formState])

  const handleDismiss = () => {
    onClose()
  }

  const handleFinish = () => {
    const data = childRefs.current.map(ref => ref.getData()).map(item => ({
      ...item,
      openingBalance: convertToCents(item.openingBalance)?.toString(),
    }))
    setFormState(data)
  }

  const saveData = async () => {
    const successBalanceUpdate = await trigger()

    if (successBalanceUpdate) {
      onClose()
    }
  }

  return (
    <>
      <ModalContextBar onClose={handleDismiss} />
      <ModalContent>
        <ModalHeading pbe='lg'>
          {stringOverrides?.title ?? 'Add opening balance'}
        </ModalHeading>
        {stringOverrides?.description && (
          <ModalDescription pbe='lg'>
            {stringOverrides?.description}
          </ModalDescription>
        )}
        <ConditionalList
          list={accounts}
          Empty={(
            <VStack slot='center'>
              <Text>
                You can close this modal.
              </Text>
            </VStack>
          )}
          Container={({ children }) => <VStack gap='md'>{children}</VStack>}
        >
          {({ item }, index) => (
            <AccountFormBox
              ref={(el: AccountFormBoxRef) => childRefs.current[index] = el}
              key={item.id}
              account={item}
              defaultValue={{
                account: item,
                isConfirmed: true,
                openingDate: getActivationDate(business),
              }}
              disableConfirmExclude={true}
            />
          )}
        </ConditionalList>
      </ModalContent>
      <ModalActions>
        <VStack gap='md'>
          {hasError && (
            <Text size={TextSize.sm}>
              An error occurred while add opening balance.
              You will have an opportunity to try again later.
            </Text>
          )}
          <Button size='lg' onPress={handleFinish} isPending={isMutating}>
            {stringOverrides?.buttonText ?? 'Submit'}
          </Button>
        </VStack>
      </ModalActions>
    </>
  )
}

export function OpeningBalanceModal({
  stringOverrides,
}: {
  stringOverrides?: OpeningBalanceModalStringOverrides
}) {
  const {
    accountsToAddOpeningBalanceInModal,
    setAccountsToAddOpeningBalanceInModal,
  } = useContext(LinkedAccountsContext)

  if (!accountsToAddOpeningBalanceInModal?.length) {
    return null
  }

  return (
    <Modal isOpen={Boolean(accountsToAddOpeningBalanceInModal.length)} size='lg'>
      {({ close }) => (
        <LinkedAccountsOpeningBalanceModalContent
          accounts={accountsToAddOpeningBalanceInModal}
          onClose={() => {
            close()
            setAccountsToAddOpeningBalanceInModal([])
          }}
          stringOverrides={stringOverrides}
        />
      )}
    </Modal>
  )
}
