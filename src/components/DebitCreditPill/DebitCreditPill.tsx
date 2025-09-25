import { useCallback } from 'react'
import classNames from 'classnames'
import { LedgerEntryDirection } from '../../schemas/generalLedger/ledgerAccount'
import './debitCreditPill.scss'

interface DebitCreditPillProps {
  value: LedgerEntryDirection
  onChange: (direction: LedgerEntryDirection) => void
  isReadOnly?: boolean
  size?: 'sm' | 'md'
}

export const DebitCreditPill = ({
  value,
  onChange,
  isReadOnly = false,
  size = 'md',
}: DebitCreditPillProps) => {
  const handleToggle = useCallback(() => {
    if (isReadOnly) return

    const newDirection = value === LedgerEntryDirection.Debit
      ? LedgerEntryDirection.Credit
      : LedgerEntryDirection.Debit

    onChange(newDirection)
  }, [value, onChange, isReadOnly])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (isReadOnly) return

    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault()
      handleToggle()
    }
  }, [handleToggle, isReadOnly])

  const isDebit = value === LedgerEntryDirection.Debit

  const className = classNames(
    'Layer__DebitCreditPill',
    `Layer__DebitCreditPill--${size}`,
    {
      'Layer__DebitCreditPill--debit': isDebit,
      'Layer__DebitCreditPill--credit': !isDebit,
      'Layer__DebitCreditPill--readonly': isReadOnly,
    },
  )

  return (
    <button
      type='button'
      onClick={handleToggle}
      onKeyDown={handleKeyDown}
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
