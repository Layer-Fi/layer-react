import React from 'react'
import { ReceiptsProvider } from '../../providers/ReceiptsProvider'
import { BankTransaction } from '../../types'
import { Purpose } from './BankTransactionMobileListItem'
import { BusinessForm } from './BusinessForm'
import { PersonalForm } from './PersonalForm'
import { SplitAndMatchForm } from './SplitAndMatchForm'
import { MemoTextProvider } from './useMemoText'

interface BankTransactionMobileFormsProps {
  purpose: Purpose
  bankTransaction: BankTransaction
  showTooltips: boolean
  showReceiptUploads?: boolean
  showDescriptions?: boolean
  isOpen?: boolean
}

export const BankTransactionMobileForms = ({
  purpose,
  bankTransaction,
  showTooltips,
  showReceiptUploads,
  showDescriptions,
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
            showDescriptions={showDescriptions}
          />
        )
      case 'personal':
        return (
          <PersonalForm
            bankTransaction={bankTransaction}
            showReceiptUploads={showReceiptUploads}
            isOpen={isOpen}
            showDescriptions={showDescriptions}
          />
        )
      case 'more':
        return (
          <SplitAndMatchForm
            bankTransaction={bankTransaction}
            showTooltips={showTooltips}
            showReceiptUploads={showReceiptUploads}
            isOpen={isOpen}
            showDescriptions={showDescriptions}
          />
        )
      default:
        return null
    }
  }

  return (
    <ReceiptsProvider bankTransaction={bankTransaction} isActive={isOpen}>
      <MemoTextProvider bankTransaction={bankTransaction} isActive={isOpen}>
        <div className='Layer__bank-transaction-mobile-list-item__form-container'>
          {getContent()}
        </div>
      </MemoTextProvider>
    </ReceiptsProvider>
  )
}
