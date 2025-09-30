import { useCallback } from 'react'
import { LedgerEntryDirection } from '../../schemas/generalLedger/ledgerAccount'
import { Badge, BadgeVariant } from '../Badge'
import { BadgeSize } from '../Badge/Badge'

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
  const handleClick = useCallback(() => {
    const newDirection = value === LedgerEntryDirection.Debit
      ? LedgerEntryDirection.Credit
      : LedgerEntryDirection.Debit

    onChange(newDirection)
  }, [value, onChange])

  const isDebit = value === LedgerEntryDirection.Debit

  return (
    <Badge
      variant={isDebit ? BadgeVariant.WARNING : BadgeVariant.SUCCESS}
      size={BadgeSize.SMALL}
      onClick={isReadOnly ? undefined : handleClick}
    >
      {isDebit ? 'Debit' : 'Credit'}
    </Badge>
  )
}
