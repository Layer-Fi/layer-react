import { type MouseEvent, useState } from 'react'
import { Pencil } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import type { BankTransaction } from '@internal-types/bankTransactions'
import { Button } from '@ui/Button/Button'
import { getRecordTransactionVariant } from '@components/BankTransactions/RecordManualTransaction/formUtils'
import { RecordTransactionModal } from '@components/BankTransactions/RecordManualTransaction/RecordTransactionModal'

type EditCustomTransactionButtonProps = {
  bankTransaction: BankTransaction
}

export function EditCustomTransactionButton({ bankTransaction }: EditCustomTransactionButtonProps) {
  const { t } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)

  return (
    <span onClick={(e: MouseEvent) => e.stopPropagation()}>
      <Button
        inset
        icon
        variant='ghost'
        aria-label={t('bankTransactions:action.edit_transaction', 'Edit transaction')}
        onPress={() => setIsOpen(true)}
      >
        <Pencil size={14} />
      </Button>
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
