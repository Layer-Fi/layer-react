import React, { useState } from 'react'
import { BankTransaction } from '../../types'
import { hasMatch } from '../../utils/bankTransactions'
import { TextButton } from '../Button'
import { MatchForm } from './MatchForm'
import { SplitForm } from './SplitForm'

interface SplitAndMatchFormProps {
  bankTransaction: BankTransaction
}

enum Purpose {
  categorize = 'categorize',
  match = 'match',
}

export const SplitAndMatchForm = ({
  bankTransaction,
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
        <SplitForm bankTransaction={bankTransaction} />
      )}
      {formType === Purpose.match && (
        <MatchForm bankTransaction={bankTransaction} />
      )}
      {anyMatch && formType === Purpose.match ? (
        <TextButton onClick={() => setFormType(Purpose.categorize)}>
          or split transaction
        </TextButton>
      ) : null}
      {anyMatch && formType === Purpose.categorize ? (
        <TextButton onClick={() => setFormType(Purpose.match)}>
          or find match
        </TextButton>
      ) : null}
    </div>
  )
}
