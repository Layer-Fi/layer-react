import React, { useEffect, useState } from 'react'
import { useBankTransactionsContext } from '../../contexts/BankTransactionsContext'
import { BankTransaction, CategorizationStatus } from '../../types'
import { isCredit } from '../../utils/bankTransactions'
import { Button } from '../Button'
import { ErrorText } from '../Typography'
import { PersonalCategories } from './constants'
import { useProfitAndLossLTM } from '../../hooks/useProfitAndLoss/useProfitAndLossLTM'

interface PersonalFormProps {
  bankTransaction: BankTransaction
  hardRefreshPnlOnCategorize?: boolean
}

const isAlreadyAssigned = (bankTransaction: BankTransaction) => {
  if (
    bankTransaction.categorization_status === CategorizationStatus.MATCHED ||
    bankTransaction?.categorization_status === CategorizationStatus.SPLIT
  ) {
    return false
  }

  return Boolean(
    bankTransaction.category &&
      PersonalCategories.includes(bankTransaction.category.display_name),
  )
}

export const PersonalForm = ({ bankTransaction, hardRefreshPnlOnCategorize }: PersonalFormProps) => {
  const { categorize: categorizeBankTransaction, isLoading } =
    useBankTransactionsContext()
  const { refetch } = useProfitAndLossLTM()
  const [showRetry, setShowRetry] = useState(false)

  useEffect(() => {
    if (bankTransaction.error) {
      setShowRetry(true)
    }
  }, [bankTransaction.error])

  const save = () => {
    categorizeBankTransaction(
      bankTransaction.id,
      {
        type: 'Category',
        category: {
          type: 'StableName',
          stable_name: isCredit(bankTransaction)
            ? 'PERSONAL_INCOME'
            : 'PERSONAL_EXPENSES',
        },
      },
      true,
    )
    if (hardRefreshPnlOnCategorize) refetch()
  }

  const alreadyAssigned = isAlreadyAssigned(bankTransaction)

  return (
    <div className='Layer__bank-transaction-mobile-list-item__personal-form'>
      <Button
        fullWidth={true}
        disabled={alreadyAssigned || isLoading || bankTransaction.processing}
        onClick={save}
      >
        {isLoading || bankTransaction.processing
          ? 'Saving...'
          : alreadyAssigned
          ? 'Saved as Personal'
          : 'Categorize as Personal'}
      </Button>
      {bankTransaction.error && showRetry ? (
        <ErrorText>
          Approval failed. Check connection and retry in few seconds.
        </ErrorText>
      ) : null}
    </div>
  )
}
