import { type MouseEvent, useState } from 'react'
import { Pencil } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import type { BankTransaction } from '@internal-types/bankTransactions'
import { Button } from '@ui/Button/Button'
import { getRecordTransactionVariant } from '@components/BankTransactions/RecordManualTransaction/formUtils'
import { RecordTransactionModal } from '@components/BankTransactions/RecordManualTransaction/RecordTransactionModal'

type EditCustomTransactionButtonProps = {
  bankTransaction: BankTransaction
  // Renders a full-width labeled button (e.g. the mobile detail panel) instead of the icon-only affordance.
  withLabel?: boolean
}

export function EditCustomTransactionButton({ bankTransaction, withLabel = false }: EditCustomTransactionButtonProps) {
  const { t } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)
  const label = t('bankTransactions:action.edit_transaction', 'Edit transaction')

  return (
    <span onClick={(e: MouseEvent) => e.stopPropagation()}>
      {withLabel
        ? (
          <Button variant='outlined' fullWidth onPress={() => setIsOpen(true)}>
            <Pencil size={14} />
            {label}
          </Button>
        )
        : (
          <Button inset icon variant='ghost' aria-label={label} onPress={() => setIsOpen(true)}>
            <Pencil size={14} />
          </Button>
        )}
      {isOpen && (
        <RecordTransactionModal
          variant={getRecordTransactionVariant(bankTransaction)}
          transaction={bankTransaction}
          isOpen
          onOpenChange={setIsOpen}
        />
      )}
    </span>
  )
}
