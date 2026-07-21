import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import type { BankTransaction } from '@internal-types/bankTransactions'
import { useArchiveBankTransaction } from '@hooks/api/businesses/[business-id]/bank-transactions/[bank-transaction-id]/useArchiveBankTransaction'
import { Button } from '@ui/Button/Button'
import { HStack } from '@ui/Stack/Stack'
import { BaseConfirmationModal } from '@components/blocks/BaseConfirmationModal/BaseConfirmationModal'

type DeleteRecordedTransactionButtonProps = {
  transaction: BankTransaction
  onDeleted: () => void
}

export function DeleteRecordedTransactionButton({ transaction, onDeleted }: DeleteRecordedTransactionButtonProps) {
  const { t } = useTranslation()
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const { trigger } = useArchiveBankTransaction({ bankTransactionId: transaction.id })

  return (
    <>
      <Button variant='outlined' status='danger' onPress={() => setIsConfirmOpen(true)}>
        <HStack gap='3xs' align='center'>
          <Trash2 size={14} />
          {t('bankTransactions:recordTransaction.action.delete', 'Delete')}
        </HStack>
      </Button>
      <BaseConfirmationModal
        isOpen={isConfirmOpen}
        onOpenChange={setIsConfirmOpen}
        title={t('bankTransactions:recordTransaction.delete.title', 'Delete transaction')}
        description={t('bankTransactions:recordTransaction.delete.description', 'This transaction will be permanently deleted. This action cannot be undone.')}
        confirmLabel={t('bankTransactions:recordTransaction.action.delete', 'Delete')}
        onConfirm={async () => {
          await trigger()
          onDeleted()
        }}
      />
    </>
  )
}
