import React, { useContext, useMemo, useState } from 'react'
import { Modal } from '../../ui/Modal/Modal'
import { ModalContextBar, ModalHeading, ModalActions, ModalContent } from '../../ui/Modal/ModalSlots'
import { Button } from '../../ui/Button/Button'
import { VStack } from '../../ui/Stack/Stack'
import { useLinkedAccounts } from '../../../hooks/useLinkedAccounts'
import { useLayerContext } from '../../../contexts/LayerContext'
import { LinkedAccount } from '../../../types/linked_accounts'
import { getActivationDate } from '../../../utils/business'
import { AccountFormBox, AccountFormBoxData } from '../AccountFormBox/AccountFormBox'
import { useBulkSetOpeningBalance } from './useUpdateOpeningBalanceAndDate'
import { LinkedAccountsContext } from '../../../contexts/LinkedAccountsContext'
import { startOfYear } from 'date-fns'

function getDataWithDefinedOpeningBalance<T extends { openingBalance: number | null }>(
  data: Record<string, T>,
): Record<string, T & { openingBalance: number }> {
  const filteredData = Object.fromEntries(
    Object.entries(data).filter(([_accountId, { openingBalance }]) => openingBalance != null),
  )

  return filteredData as Record<string, T & { openingBalance: number }>
}

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

  const [formsData, setFormsData] = useState<Record<
    string,
    AccountFormBoxData & { account: LinkedAccount }>
  >(
    () => Object.fromEntries(
      accounts.map(account => [
        account.id,
        {
          account,
          openingDate: getActivationDate(business) ?? startOfYear(new Date()),
          openingBalance: null,
        },
      ]),
    ),
  )

  const { filteredData, isSubmitDisabled } = useMemo(() => {
    const filteredData = getDataWithDefinedOpeningBalance(formsData)

    return {
      filteredData,
      isSubmitDisabled: Object.keys(filteredData).length !== Object.keys(formsData).length,
    }
  }, [formsData])

  const {
    trigger,
    isMutating,
  } = useBulkSetOpeningBalance(
    filteredData,
    {
      onSuccess: async () => {
        await refetchAccounts()
        onClose()
      },
    },
  )

  return (
    <>
      <ModalContextBar onClose={onClose} />
      <ModalHeading pbe='lg'>
        {stringOverrides?.title ?? 'Add Opening Balance'}
      </ModalHeading>
      <ModalContent>
        <VStack gap='md'>
          {Object.values(formsData).map(({ account, openingBalance, openingDate }) => (
            <AccountFormBox
              key={account.id}
              account={account}
              value={{ openingBalance, openingDate }}
              onChange={newValue => setFormsData(
                currentFormsData => ({
                  ...currentFormsData,
                  [account.id]: { ...currentFormsData[account.id], ...newValue } }),
              )}
            />
          ),
          )}
        </VStack>
      </ModalContent>
      <ModalActions>
        <VStack gap='md'>
          <Button
            size='lg'
            onPress={() => { void trigger() }}
            isPending={isMutating}
            isDisabled={isSubmitDisabled}
          >
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
