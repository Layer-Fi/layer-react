import React, { useContext, useState } from 'react'
import { Modal } from '../../ui/Modal/Modal'
import { ModalContextBar, ModalHeading, ModalActions, ModalContent } from '../../ui/Modal/ModalSlots'
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

  const handleSubmit = async () => {
    const savedIds = await bulkUpdate(
      formsData
        .filter(item => !item.saved)
        .map(item => ({
          ...item,
          openingBalance: convertToCents(item.openingBalance)?.toString(),
        })))

    setFormsData(formsData.map(
      item => ({ ...item, saved: item.saved || savedIds.includes(item.account.id) }),
    ))
  }

  return (
    <>
      <ModalContextBar onClose={onClose} />
      <ModalHeading pbe='lg'>
        {stringOverrides?.title ?? 'Add Opening Balance'}
      </ModalHeading>
      <ModalContent>
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

  const shouldShowModal = Boolean(accountsToAddOpeningBalanceInModal.length)

  if (!shouldShowModal) {
    return null
  }

  return (
    <Modal
      isOpen={shouldShowModal}
      isDismissable
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          setAccountsToAddOpeningBalanceInModal([])
        }
      }}
      size='lg'
    >
      {({ close }) => (
        <LinkedAccountsOpeningBalanceModalContent
          accounts={accountsToAddOpeningBalanceInModal}
          onClose={close}
          stringOverrides={stringOverrides}
        />
      )}
    </Modal>
  )
}
