import React, { useEffect, useRef, useState } from 'react'
import { AccountFormBox, AccountFormBoxData, AccountFormBoxRef } from '../AccountFormBox/AccountFormBox'
import { LinkedAccount } from '../../../types/linked_accounts'
import { getActivationDate } from '../../../utils/business'
import { useLayerContext } from '../../../contexts/LayerContext'
import { Button } from '../../Button'
import { useUpdateOpeningBalanceAndDate } from '../OpeningBalanceModal/useUpdateOpeningBalanceAndDate'
import { useConfirmAndExcludeMultiple } from '../ConfirmationModal/useConfirmAndExcludeMultiple'
import { ErrorMessage } from '../../ui/ErrorMessage/ErrorMessage'
import { convertToCents } from '../../../utils/format'

type LinkedAccountsOnboardingFormProps = {
  accounts?: LinkedAccount[]
  onSuccess: () => void
}

export const LinkedAccountsOnboardingForm = ({
  accounts,
  onSuccess,
}: LinkedAccountsOnboardingFormProps) => {
  const { business } = useLayerContext()
  const childRefs = useRef<AccountFormBoxRef[]>([])
  const [formState, setFormState] = useState<AccountFormBoxData[]>([])

  const {
    trigger: triggerOpeningBalance,
    isMutating: isMutatingOpeningBalance,
    error: errorOpeningBalance,
  } = useUpdateOpeningBalanceAndDate(formState, { onSuccess: () => {} })

  const {
    trigger: triggerConfirmAccount,
    isMutating: isMutatingConfirmAccount,
    error: errorConfirmAccount,
  } = useConfirmAndExcludeMultiple(
    Object.fromEntries(formState.map(({ account: { id }, isConfirmed }) => [id, isConfirmed])),
    { onSuccess: () => {} },
  )

  const hasError = errorOpeningBalance || errorConfirmAccount
  const isMutating = isMutatingOpeningBalance || isMutatingConfirmAccount

  useEffect(() => {
    if (formState.length > 0) {
      saveData()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formState])

  const handleSubmit = () => {
    const data = childRefs.current.map(ref => ref.getData()).map(item => ({
      ...item,
      openingBalance: convertToCents(item.openingBalance)?.toString(),
    }))
    setFormState(data)
  }

  const saveData = async () => {
    const successConfirmAccount = await triggerConfirmAccount()
    const successBalanceUpdate = await triggerOpeningBalance()

    if (successBalanceUpdate && successConfirmAccount) {
      onSuccess()
    }
  }

  return (
    <div className='Layer__laof'>
      {accounts?.map((account, index) => (
        <AccountFormBox
          ref={(el: AccountFormBoxRef) => childRefs.current[index] = el}
          key={index}
          account={account}
          defaultValue={{
            account: account,
            isConfirmed: true,
            openingDate: getActivationDate(business),
          }}
          disableConfirmExclude={false}
        />
      ))}
      <ErrorMessage>{hasError && 'Something went wrong'}</ErrorMessage>
      <Button
        onClick={handleSubmit}
        disabled={isMutating}
      >
        Submit
      </Button>
    </div>
  )
}
