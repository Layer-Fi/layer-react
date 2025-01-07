import React, { useState } from 'react'
import { AccountFormBox, AccountFormBoxData } from '../AccountFormBox/AccountFormBox'
import { LinkedAccount } from '../../../types/linked_accounts'
import { getActivationDate } from '../../../utils/business'
import { useLayerContext } from '../../../contexts/LayerContext'
import { Button } from '../../Button'
import { useUpdateOpeningBalanceAndDate } from '../OpeningBalanceModal/useUpdateOpeningBalanceAndDate'
import { useConfirmAndExcludeMultiple } from '../ConfirmationModal/useConfirmAndExcludeMultiple'
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
  const [formsData, setFormsData] = useState<AccountFormBoxData[]>([])

  const {
    bulkUpdate: updateOpeningBalance,
    isLoading: isMutatingOpeningBalance,
    errors: errorsOpeningBalance,
  } = useUpdateOpeningBalanceAndDate({ onSuccess: () => {} })

  /** @TODO handle errors */
  const {
    trigger: triggerConfirmAccount,
    isMutating: isMutatingConfirmAccount,
  } = useConfirmAndExcludeMultiple(
    Object.fromEntries(formsData.map(({ account: { id }, isConfirmed }) => [id, isConfirmed])),
    { onSuccess: () => {} },
  )

  const isMutating = isMutatingOpeningBalance || isMutatingConfirmAccount

  const handleSubmit = async () => {
    const successConfirmAccount = await triggerConfirmAccount()
    const savedIds = await updateOpeningBalance(
      formsData
        .filter(item => !item.saved && !item.isConfirmed)
        .map(item => ({
          ...item,
          openingBalance: convertToCents(item.openingBalance)?.toString(),
        })))

    setFormsData(formsData.map(
      item => ({ ...item, saved: item.saved || savedIds.includes(item.account.id) }),
    ))

    if (successConfirmAccount && savedIds.length === formsData.length) {
      onSuccess()
    }
  }

  return (
    <div className='Layer__laof'>
      {accounts?.map((account, index) => (
        <AccountFormBox
          key={index}
          account={account}
          defaultValue={{
            account: account,
            isConfirmed: true,
            openingDate: getActivationDate(business),
          }}
          disableConfirmExclude={false}
          onChange={v => setFormsData(formsData.map(
            item => item.account.id === v.account.id ? v : item,
          ))}
          errors={errorsOpeningBalance[account.id]}
        />
      ))}
      <Button
        onClick={handleSubmit}
        disabled={isMutating}
      >
        Submit
      </Button>
    </div>
  )
}
