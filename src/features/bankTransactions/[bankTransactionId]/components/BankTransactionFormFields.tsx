import { BankTransactionMemo } from '../../../../components/BankTransactions/BankTransactionMemo/BankTransactionMemo'
import { VStack } from '../../../../components/ui/Stack/Stack'
import type { BankTransaction } from '../../../../types'
import { BankTransactionSecondPartySelector } from '../secondParty/components/BankTransactionSecondPartySelector'
import { useBankTransactionSecondPartyVisibility } from '../secondParty/components/BankTransactionSecondPartyVisibilityProvider'
import { BankTransactionTagSelector } from '../tags/components/BankTransactionTagSelector'
import { useBankTransactionTagVisibility } from '../tags/components/BankTransactionTagVisibilityProvider'

type BankTransactionFormFieldProps = {
  bankTransaction: Pick<
    BankTransaction,
    'id' | 'transaction_tags' | 'customer' | 'vendor'
  >
  showDescriptions?: boolean
}

export function BankTransactionFormFields({
  bankTransaction,
  showDescriptions,
}: BankTransactionFormFieldProps) {
  const { showTags } = useBankTransactionTagVisibility()
  const { showSecondParty } = useBankTransactionSecondPartyVisibility()

  if (!showTags && !showSecondParty && !showDescriptions) {
    return null
  }

  return (
    <VStack pi='md' gap='md'>
      {showSecondParty
        ? <BankTransactionSecondPartySelector bankTransaction={bankTransaction} />
        : null}
      {showTags
        ? <BankTransactionTagSelector bankTransaction={bankTransaction} />
        : null}
      {showDescriptions
        ? <BankTransactionMemo bankTransactionId={bankTransaction.id} />
        : null}
    </VStack>
  )
}
