import React from 'react'
import { BankTransaction } from '../../types'
import { Purpose } from './BankTransactionMobileListItem'
import { BusinessForm } from './BusinessForm'
import { PersonalForm } from './PersonalForm'
import { SplitAndMatchForm } from './SplitAndMatchForm'

interface BankTransactionMobileFormsProps {
  purpose: Purpose
  bankTransaction: BankTransaction
}

export const BankTransactionMobileForms = ({
  purpose,
  bankTransaction,
}: BankTransactionMobileFormsProps) => {
  const getContent = () => {
    switch (purpose) {
      case 'business':
        return <BusinessForm bankTransaction={bankTransaction} />
      case 'personal':
        return <PersonalForm bankTransaction={bankTransaction} />
      case 'more':
        return <SplitAndMatchForm bankTransaction={bankTransaction} />
      default:
        return null
    }
  }

  return (
    <div className='Layer__bank-transaction-mobile-list-item__form-container'>
      {getContent()}
    </div>
  )
}
