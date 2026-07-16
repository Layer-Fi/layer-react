import { type MouseEvent, useState } from 'react'
import { Pencil } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import type { BankTransaction } from '@internal-types/bankTransactions'
import { isCustomTransaction } from '@utils/bankTransactions/shared'
import { useCustomAccounts } from '@hooks/api/businesses/[business-id]/custom-accounts/useCustomAccounts'
import { Button } from '@ui/Button/Button'
import { getRecordTransactionVariant } from '@components/BankTransactions/RecordManualTransaction/formUtils'
import { RecordTransactionModal } from '@components/BankTransactions/RecordManualTransaction/RecordTransactionModal'

type EditCustomTransactionButtonProps = {
  bankTransaction: BankTransaction
}

export function EditCustomTransactionButton({ bankTransaction }: EditCustomTransactionButtonProps) {
  const { t } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)
  const { data: customAccounts } = useCustomAccounts()

  const isEditable = isCustomTransaction(bankTransaction)
    && customAccounts?.some(account => account.id === bankTransaction.sourceAccountId)

  if (!isEditable) return null

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
