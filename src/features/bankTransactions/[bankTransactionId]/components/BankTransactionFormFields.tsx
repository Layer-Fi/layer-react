import { BankTransactionMemo } from '../../../../components/BankTransactions/BankTransactionMemo/BankTransactionMemo'
import { VStack } from '../../../../components/ui/Stack/Stack'
import type { BankTransaction } from '../../../../types'
import { BankTransactionCustomerVendorSelector } from '../customerVendor/components/BankTransactionCustomerVendorSelector'
import { useBankTransactionCustomerVendorVisibility } from '../customerVendor/components/BankTransactionCustomerVendorVisibilityProvider'
import { BankTransactionTagSelector } from '../tags/components/BankTransactionTagSelector'
import { useBankTransactionTagVisibility } from '../tags/components/BankTransactionTagVisibilityProvider'

type BankTransactionFormFieldProps = {
  bankTransaction: Pick<
    BankTransaction,
    'id' | 'transaction_tags' | 'customer' | 'vendor'
  >
  showDescriptions?: boolean
  turnOffTags?: boolean
  turnOffCustomerVendor?: boolean
}

export function BankTransactionFormFields({
  bankTransaction,
  showDescriptions,
  turnOffTags = false,
  turnOffCustomerVendor = false,
}: BankTransactionFormFieldProps) {
  const { showTags } = useBankTransactionTagVisibility()
  const { showCustomerVendor } = useBankTransactionCustomerVendorVisibility()

  if (!showTags && !showCustomerVendor && !showDescriptions) {
    return null
  }

  return (
    <VStack pi='md' pbe='lg' gap='md'>
      {showCustomerVendor && !turnOffCustomerVendor
        ? <BankTransactionCustomerVendorSelector bankTransaction={bankTransaction} />
        : null}
      {showTags && !turnOffTags
        ? <BankTransactionTagSelector bankTransaction={bankTransaction} />
        : null}
      {showDescriptions
        ? <BankTransactionMemo bankTransactionId={bankTransaction.id} />
        : null}
    </VStack>
  )
}
