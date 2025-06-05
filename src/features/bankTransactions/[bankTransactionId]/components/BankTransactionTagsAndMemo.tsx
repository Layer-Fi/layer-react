import { BankTransactionMemo } from '../../../../components/BankTransactions/BankTransactionMemo/BankTransactionMemo'
import { VStack } from '../../../../components/ui/Stack/Stack'
import type { BankTransaction } from '../../../../types'
import { BankTransactionTagSelector } from '../tags/components/BankTransactionTagSelector'
import { useBankTransactionTagVisibility } from '../tags/components/BankTransactionTagVisibilityProvider'

type BankTransactionTagsAndMemoProps = {
  bankTransaction: Pick<BankTransaction, 'id' | 'transaction_tags'>
  showDescriptions?: boolean
}

export function BankTransactionTagsAndMemo({
  bankTransaction,
  showDescriptions,
}: BankTransactionTagsAndMemoProps) {
  const { showTags } = useBankTransactionTagVisibility()

  if (!showTags && !showDescriptions) {
    return null
  }

  return (
    <VStack pi='md' gap='sm'>
      {showTags
        ? <BankTransactionTagSelector bankTransaction={bankTransaction} />
        : null}
      {showDescriptions
        ? <BankTransactionMemo bankTransactionId={bankTransaction.id} />
        : null}
    </VStack>
  )
}
