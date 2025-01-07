import React, { useContext, useState } from 'react'
import { Modal } from '../../ui/Modal/Modal'
import { ModalContextBar, ModalHeading, ModalActions, ModalContent, ModalDescription } from '../../ui/Modal/ModalSlots'
import { Button } from '../../ui/Button/Button'
import { VStack } from '../../ui/Stack/Stack'
import { useLinkedAccounts } from '../../../hooks/useLinkedAccounts'
import { useLayerContext } from '../../../contexts/LayerContext'
import { LinkedAccount } from '../../../types/linked_accounts'
import { getActivationDate } from '../../../utils/business'
import { AccountFormBox, AccountFormBoxData } from '../AccountFormBox/AccountFormBox'
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

  // Mark if any data has been successfully saved with API
  // so the refetchAccounts should be called on onClose
  const [touched, setTouched] = useState(false)

  const [formsData, setFormsData] = useState<AccountFormBoxData[]>(accounts.map(item => (
    {
      account: item,
      isConfirmed: true,
      openingDate: getActivationDate(business),
    }
  )))

  const { bulkUpdate, isLoading, errors } = useUpdateOpeningBalanceAndDate({
    onSuccess: () => {
      refetchAccounts()
      onClose()
    },
  })

  const handleDismiss = () => {
    if (touched) {
      refetchAccounts()
    }

    onClose()
  }

  const handleSubmit = async () => {
    const savedIds = await bulkUpdate(
      formsData
        .filter(item => !item.saved)
        .map(item => ({
          ...item,
          openingBalance: convertToCents(item.openingBalance)?.toString(),
        })))

    if (savedIds.length > 0) {
      setTouched(true)
    }

    setFormsData(formsData.map(
      item => ({ ...item, saved: item.saved || savedIds.includes(item.account.id) }),
    ))
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
        <VStack gap='md'>
          {formsData.map(item => (
            <AccountFormBox
              key={item.account.id}
              account={item.account}
              defaultValue={item}
              disableConfirmExclude={true}
              errors={errors[item.account.id]}
              onChange={v => setFormsData(formsData.map(
                item => item.account.id === v.account.id ? v : item,
              ))}
            />
          ),
          )}
        </VStack>
      </ModalContent>
      <ModalActions>
        <VStack gap='md'>
          <Button size='lg' onPress={handleSubmit} isPending={isLoading}>
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
