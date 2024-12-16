import React, { useEffect, useRef, useState } from 'react'
import { Modal } from '../../ui/Modal/Modal'
import { ModalContextBar, ModalHeading, ModalActions, ModalContent, ModalDescription } from '../../ui/Modal/ModalSlots'
import useSWRMutation from 'swr/mutation'

import { Button } from '../../ui/Button/Button'
import { VStack } from '../../ui/Stack/Stack'
import { useLinkedAccounts } from '../../../hooks/useLinkedAccounts'
import { ConditionalList } from '../../utility/ConditionalList'
import { ConfirmAndOpeningBalanceFormData, ConfirmAndOpeningBalanceFormRef, ConfirmAndOpeningBalanceForm } from '../ConfirmAndOpeningBalanceForm/ConfirmAndOpeningBalanceForm'
import type { Awaitable } from '../../../types/utility/promises'
import { P } from '../../ui/Typography/Text'
import { useAuth } from '../../../hooks/useAuth'
import { useLayerContext } from '../../../contexts/LayerContext'
import { LinkedAccount } from '../../../types/linked_accounts'
import { Layer } from '../../../api/layer'
import { getActivationDate } from '../../../utils/business'

type OpeningBalanceModalStringOverrides = {
  title?: string
  description?: string
  buttonText?: string
}

export function useUpdateOpeningBalanceAndDate(
  formState: ConfirmAndOpeningBalanceFormData[],
  { onSuccess }: { onSuccess: () => Awaitable<unknown> }
) {
  const { data: auth } = useAuth()
  const { businessId } = useLayerContext()

  const updateData = ({
    account: { id: accountId },
    openingBalance: openingBalance,
    openingDate: openingDate,
  }: ConfirmAndOpeningBalanceFormData) => {
    return Layer.updateOpeningBalance(
      auth?.apiUrl ?? '',
      auth?.access_token,
      {
        params: {
          businessId,
          accountId,
        },
        body: {
          effective_at: openingDate?.toISOString(),
          balance: openingBalance ? openingBalance.toString() : undefined,
        }
      }
    )
  }

  return useSWRMutation(
    `/v1/businesses/${businessId}/external-accounts/opening-balance`,
    () => Promise.all(
      formState.map((item) => {
        if (item.openingBalance && item.openingDate && item.isConfirmed) {
          return updateData(item)
        }
      }
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


function LinkedAccountsOpeningBalanceModalContent({
  onClose,
  account,
  stringOverrides,
}: {
  onClose: () => void
  account: LinkedAccount
  stringOverrides?: OpeningBalanceModalStringOverrides
}) {
  const { business } = useLayerContext()
  const { refetchAccounts } = useLinkedAccounts()

  const childRefs = useRef<ConfirmAndOpeningBalanceFormRef[]>([])

  const [ formState, setFormState ] = useState<ConfirmAndOpeningBalanceFormData[]>([])

  const {
    trigger,
    isMutating,
    error: hasError
  } = useUpdateOpeningBalanceAndDate(formState, {
    onSuccess: refetchAccounts
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
    const data = childRefs.current.map(ref => ref.getData())
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
      <ModalHeading pbe='2xs'>
        {stringOverrides?.title ?? 'Add opening balance'}
      </ModalHeading>
      <ModalDescription pbe='md'>
        {stringOverrides?.description}
      </ModalDescription>
      <ModalContent>
        <ConditionalList
          list={[account]}
          Empty={
            <VStack slot='center'>
              <P align='center'>
                You can close this modal.
              </P>
            </VStack>
          }
          Container={({ children }) => <VStack gap='md'>{children}</VStack>}
        >
          {({ item }, index) =>
            <ConfirmAndOpeningBalanceForm
              ref={(el: ConfirmAndOpeningBalanceFormRef) => childRefs.current[index] = el}
              key={item.id}
              account={item}
              defaultValue={{ account: item, isConfirmed: true, openingDate: getActivationDate(business) }}
              compact={true}
              disableConfirmExclude={true}
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
                  An error occurred while add opening balance.
                  You will have an opportunity to try again later.
                </P>
                <Button size='lg' onPress={handleDismiss}>
                  Close
                </Button>
              </>
            )
            : (
              <Button size='lg' onPress={handleFinish} isPending={isMutating}>
                {stringOverrides?.buttonText ?? 'Submit'}
              </Button>
            )
          }
        </VStack>
      </ModalActions>
    </>
  )
}

export function OpeningBalanceModal({
  account,
  onClose,
  stringOverrides,
}: {
  account?: LinkedAccount
  onClose: () => void
  stringOverrides?: OpeningBalanceModalStringOverrides
}) {
  if (!account) {
    return null
  }

  return (
    <Modal isOpen={Boolean(account)}>
      {({ close }) => (
        <LinkedAccountsOpeningBalanceModalContent
          account={account}
          onClose={() => {
            close()
            onClose()
          }}
          stringOverrides={stringOverrides}
        />
      )}
    </Modal>
  )
}
