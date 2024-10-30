import React, { useState } from 'react'
import { BankTransaction } from '../../types'
import { hasMatch } from '../../utils/bankTransactions'
import { TextButton } from '../Button'
import { MatchForm } from './MatchForm'
import { SplitForm } from './SplitForm'

interface SplitAndMatchFormProps {
  bankTransaction: BankTransaction
  showTooltips: boolean
  showReceiptUploads?: boolean
  showDescriptions?: boolean
  isOpen?: boolean
}

enum Purpose {
  categorize = 'categorize',
  match = 'match',
}

export const SplitAndMatchForm = ({
  bankTransaction,
  showTooltips,
  showReceiptUploads,
  isOpen,
  showDescriptions,
}: SplitAndMatchFormProps) => {
  const anyMatch = hasMatch(bankTransaction)
  const [formType, setFormType] = useState(
    bankTransaction.category
      ? Purpose.categorize
      : anyMatch
        ? Purpose.match
        : Purpose.categorize,
  )

  return (
    <div className='Layer__bank-transaction-mobile-list-item__split-and-match-form'>
      {formType === Purpose.categorize && (
        <SplitForm
          bankTransaction={bankTransaction}
          showTooltips={showTooltips}
          showReceiptUploads={showReceiptUploads}
          showDescriptions={showDescriptions}
        />
      )}
      {formType === Purpose.match && (
        <MatchForm
          bankTransaction={bankTransaction}
          showReceiptUploads={showReceiptUploads}
          showDescriptions={showDescriptions}
        />
      )}
      {anyMatch && formType === Purpose.match ? (
        <div className='Layer__bank-transaction-mobile-list-item__switch-form-btns'>
          <TextButton onClick={() => setFormType(Purpose.categorize)}>
            or split transaction
          </TextButton>
        </div>
      ) : null}
      {anyMatch && formType === Purpose.categorize ? (
        <div className='Layer__bank-transaction-mobile-list-item__switch-form-btns'>
          <TextButton onClick={() => setFormType(Purpose.match)}>
            or find match
          </TextButton>
        </div>
      ) : null}
    </div>
  )
}
