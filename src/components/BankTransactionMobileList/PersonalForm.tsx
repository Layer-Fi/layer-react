import React from 'react'
import { useBankTransactions } from '../../hooks/useBankTransactions'
import { BankTransaction, CategorizationStatus } from '../../types'
import { isCredit } from '../../utils/bankTransactions'
import { Button } from '../Button'

interface PersonalFormProps {
  bankTransaction: BankTransaction
}

// @TODO refactor with PersonalForm
const PersonalCategories = ['PERSONAL_INCOME', 'PERSONAL_EXPENSES']

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

export const PersonalForm = ({ bankTransaction }: PersonalFormProps) => {
  const { categorize: categorizeBankTransaction } = useBankTransactions()

  const save = () => {
    categorizeBankTransaction(bankTransaction.id, {
      type: 'Category',
      category: {
        type: 'StableName',
        stable_name: isCredit(bankTransaction)
          ? 'PERSONAL_INCOME'
          : 'PERSONAL_EXPENSES',
      },
    })
  }

  // @TODO - test when assigning to personal works
  const alreadyAssigned = isAlreadyAssigned(bankTransaction)

  return (
    <div className='Layer__bank-transaction-mobile-list-item__personal-form'>
      <Button fullWidth={true} disabled={alreadyAssigned} onClick={save}>
        {alreadyAssigned ? 'Saved as Personal' : 'Categorize as Personal'}
      </Button>
    </div>
  )
}
