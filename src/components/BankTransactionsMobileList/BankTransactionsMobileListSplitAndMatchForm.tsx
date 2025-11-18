import { useState } from 'react'

import { type BankTransaction } from '@internal-types/bank_transactions'
import { hasMatch } from '@utils/bankTransactions'
import { BankTransactionsMobileListMatchForm } from '@components/BankTransactionsMobileList/BankTransactionsMobileListMatchForm'
import { BankTransactionsMobileListSplitForm } from '@components/BankTransactionsMobileList/BankTransactionsMobileListSplitForm'
import { TextButton } from '@components/Button/TextButton'

interface BankTransactionsMobileListSplitAndMatchFormProps {
  bankTransaction: BankTransaction
  showTooltips: boolean
  showCategorization?: boolean
  showReceiptUploads?: boolean
  showDescriptions?: boolean
}

enum Purpose {
  categorize = 'categorize',
  match = 'match',
}

export const BankTransactionsMobileListSplitAndMatchForm = ({
  bankTransaction,
  showTooltips,
  showReceiptUploads,
  showDescriptions,
  showCategorization,
}: BankTransactionsMobileListSplitAndMatchFormProps) => {
  const anyMatch = hasMatch(bankTransaction)
  const [formType, setFormType] = useState(
    bankTransaction.category
      ? Purpose.categorize
      : anyMatch
        ? Purpose.match
        : Purpose.categorize,
  )

  return (
    <>
      {formType === Purpose.categorize && (
        <BankTransactionsMobileListSplitForm
          bankTransaction={bankTransaction}
          showTooltips={showTooltips}
          showReceiptUploads={showReceiptUploads}
          showDescriptions={showDescriptions}
          showCategorization={showCategorization}
        />
      )}
      {formType === Purpose.match && (
        <BankTransactionsMobileListMatchForm
          bankTransaction={bankTransaction}
          showReceiptUploads={showReceiptUploads}
          showDescriptions={showDescriptions}
          showCategorization={showCategorization}
        />
      )}
      {showCategorization && anyMatch && (
        formType === Purpose.match
          ? (
            <TextButton onClick={() => setFormType(Purpose.categorize)}>
              or split transaction
            </TextButton>
          )
          : (
            <TextButton onClick={() => setFormType(Purpose.match)}>
              or find match
            </TextButton>
          )
      )}
    </>
  )
}
