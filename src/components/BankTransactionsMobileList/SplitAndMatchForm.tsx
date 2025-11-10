import { TextButton } from '@components/Button/TextButton'
import { useState } from 'react'
import { BankTransaction } from '@internal-types/bank_transactions'
import { hasMatch } from '@utils/bankTransactions'
import { MatchForm } from '@components/BankTransactionsMobileList/MatchForm'
import { SplitForm } from '@components/BankTransactionsMobileList/SplitForm'

interface SplitAndMatchFormProps {
  bankTransaction: BankTransaction
  showTooltips: boolean
  showCategorization?: boolean
  showReceiptUploads?: boolean
}

enum Purpose {
  categorize = 'categorize',
  match = 'match',
}

export const SplitAndMatchForm = ({
  bankTransaction,
  showTooltips,
  showReceiptUploads,
  showCategorization,
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
          showCategorization={showCategorization}
        />
      )}
      {formType === Purpose.match && (
        <MatchForm
          bankTransaction={bankTransaction}
          showReceiptUploads={showReceiptUploads}
          showCategorization={showCategorization}
        />
      )}
      {showCategorization && anyMatch && formType === Purpose.match
        ? (
          <div className='Layer__bank-transaction-mobile-list-item__switch-form-btns'>
            <TextButton onClick={() => setFormType(Purpose.categorize)}>
              or split transaction
            </TextButton>
          </div>
        )
        : null}
      {showCategorization && anyMatch && formType === Purpose.categorize
        ? (
          <div className='Layer__bank-transaction-mobile-list-item__switch-form-btns'>
            <TextButton onClick={() => setFormType(Purpose.match)}>
              or find match
            </TextButton>
          </div>
        )
        : null}
    </div>
  )
}
