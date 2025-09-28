import { useCallback } from 'react'
import classNames from 'classnames'
import { LedgerEntryDirection } from '../../schemas/generalLedger/ledgerAccount'
import './debitCreditPill.scss'

interface DebitCreditPillProps {
  value: LedgerEntryDirection
  onChange: (direction: LedgerEntryDirection) => void
  isReadOnly?: boolean
}

export const DebitCreditPill = ({
  value,
  onChange,
  isReadOnly = false,
}: DebitCreditPillProps) => {
  const handleToggle = useCallback(() => {
    if (isReadOnly) return

    const newDirection = value === LedgerEntryDirection.Debit
      ? LedgerEntryDirection.Credit
      : LedgerEntryDirection.Debit

    onChange(newDirection)
  }, [value, onChange, isReadOnly])

  const isDebit = value === LedgerEntryDirection.Debit

  const className = classNames(
    'Layer__DebitCreditPill',
    {
      'Layer__DebitCreditPill--debit': isDebit,
      'Layer__DebitCreditPill--credit': !isDebit,
    },
  )

  return (
    <button
      type='button'
      onClick={handleToggle}
      disabled={isReadOnly}
      className={className}
      aria-label={`Toggle between debit and credit. Currently ${value.toLowerCase()}`}
      aria-pressed={isDebit}
      role='switch'
      tabIndex={isReadOnly ? -1 : 0}
    >
      {isDebit ? 'Debit' : 'Credit'}
    </button>
  )
}
