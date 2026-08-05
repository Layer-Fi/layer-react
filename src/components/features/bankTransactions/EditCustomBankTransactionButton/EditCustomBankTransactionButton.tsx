import { type MouseEvent, useState } from 'react'
import { Pencil } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import type { BankTransaction } from '@internal-types/features/bankTransactions/bankTransaction'
import { Button } from '@ui/Button/Button'
import { getRecordBankTransactionVariant } from '@features/bankTransactions/RecordBankTransactionForm/formUtils'
import { RecordBankTransactionModal } from '@features/bankTransactions/RecordBankTransactionModal/RecordBankTransactionModal'

type EditCustomBankTransactionButtonProps = {
  bankTransaction: BankTransaction
  withLabel?: boolean
}

export function EditCustomBankTransactionButton({ bankTransaction, withLabel = false }: EditCustomBankTransactionButtonProps) {
  const { t } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)
  const label = t('bankTransactions:action.edit_transaction', 'Edit transaction')
  const buttonProps = withLabel
    ? { variant: 'outlined' as const, fullWidth: true }
    : { variant: 'ghost' as const, icon: true, inset: true as const, ['aria-label']: label }

  return (
    <span onClick={(e: MouseEvent) => e.stopPropagation()}>
      <Button {...buttonProps} onPress={() => setIsOpen(true)}>
        <Pencil size={14} />
        {withLabel && label}
      </Button>
      {isOpen && (
        <RecordBankTransactionModal
          variant={getRecordBankTransactionVariant(bankTransaction)}
          transaction={bankTransaction}
          isOpen
          onOpenChange={setIsOpen}
        />
      )}
    </span>
  )
}
