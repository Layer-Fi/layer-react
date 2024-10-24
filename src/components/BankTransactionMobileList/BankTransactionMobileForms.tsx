import React from 'react'
import { ReceiptsProvider } from '../../providers/ReceiptsProvider'
import { BankTransaction } from '../../types'
import { Purpose } from './BankTransactionMobileListItem'
import { BusinessForm } from './BusinessForm'
import { PersonalForm } from './PersonalForm'
import { SplitAndMatchForm } from './SplitAndMatchForm'

interface BankTransactionMobileFormsProps {
  purpose: Purpose
  bankTransaction: BankTransaction
  showTooltips: boolean
  showReceiptUploads?: boolean
  isOpen?: boolean
}

export const BankTransactionMobileForms = ({
  purpose,
  bankTransaction,
  showTooltips,
  showReceiptUploads,
  isOpen,
}: BankTransactionMobileFormsProps) => {
  const getContent = () => {
    switch (purpose) {
      case 'business':
        return (
          <BusinessForm
            bankTransaction={bankTransaction}
            showTooltips={showTooltips}
            showReceiptUploads={showReceiptUploads}
          />
        )
      case 'personal':
        return (
          <PersonalForm
            bankTransaction={bankTransaction}
            showReceiptUploads={showReceiptUploads}
            isOpen={isOpen}
          />
        )
      case 'more':
        return (
          <SplitAndMatchForm
            bankTransaction={bankTransaction}
            showTooltips={showTooltips}
            showReceiptUploads={showReceiptUploads}
            isOpen={isOpen}
          />
        )
      default:
        return null
    }
  }

  return (
    <ReceiptsProvider bankTransaction={bankTransaction} isActive={isOpen}>
      <div className='Layer__bank-transaction-mobile-list-item__form-container'>
        {getContent()}
      </div>
    </ReceiptsProvider>
  )
}
