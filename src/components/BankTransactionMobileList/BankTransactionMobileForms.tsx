import React from 'react'
import { BankTransaction } from '../../types'
import { Purpose } from './BankTransactionMobileListItem'
import { BusinessForm } from './BusinessForm'
import { PersonalForm } from './PersonalForm'
import { SplitAndMatchForm } from './SplitAndMatchForm'

interface BankTransactionMobileFormsProps {
  purpose: Purpose
  bankTransaction: BankTransaction
  hardRefreshPnlOnCategorize?: boolean
}

export const BankTransactionMobileForms = ({
  purpose,
  bankTransaction,
  hardRefreshPnlOnCategorize
}: BankTransactionMobileFormsProps) => {
  const getContent = () => {
    switch (purpose) {
      case 'business':
        return <BusinessForm bankTransaction={bankTransaction} hardRefreshPnlOnCategorize={hardRefreshPnlOnCategorize} />
      case 'personal':
        return <PersonalForm bankTransaction={bankTransaction} hardRefreshPnlOnCategorize={hardRefreshPnlOnCategorize}/>
      case 'more':
        return <SplitAndMatchForm bankTransaction={bankTransaction} hardRefreshPnlOnCategorize={hardRefreshPnlOnCategorize}/>
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
