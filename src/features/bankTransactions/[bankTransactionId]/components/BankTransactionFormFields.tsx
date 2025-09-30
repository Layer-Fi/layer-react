import { useMemo } from 'react'
import { BankTransactionMemo } from '../../../../components/BankTransactions/BankTransactionMemo/BankTransactionMemo'
import { VStack } from '../../../../components/ui/Stack/Stack'
import type { BankTransaction } from '../../../../types'
import { BankTransactionCustomerVendorSelector } from '../customerVendor/components/BankTransactionCustomerVendorSelector'
import { useBankTransactionCustomerVendorVisibility } from '../customerVendor/components/BankTransactionCustomerVendorVisibilityProvider'
import { useBankTransactionTagVisibility } from '../tags/components/BankTransactionTagVisibilityProvider'
import { TagDimensionsGroup } from '../../../../components/Journal/JournalEntryForm/TagDimensionsGroup'
import { makeTag } from '../../../tags/tagSchemas'
import {
  useEffectiveBookkeepingStatus,
  BookkeepingStatus,
} from '../../../../hooks/bookkeeping/useBookkeepingStatus'

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
  const status = useEffectiveBookkeepingStatus()
  const isReadOnly = status === BookkeepingStatus.ACTIVE

  const selectedTags = useMemo(
    () => bankTransaction.transaction_tags.map(({ id, key, value, dimension_display_name, value_display_name, archived_at, _local }) => makeTag({
      id,
      key,
      value,
      dimensionDisplayName: dimension_display_name,
      valueDisplayName: value_display_name,
      archivedAt: archived_at,
      _local: {
        isOptimistic: _local?.isOptimistic ?? false,
      },
    })),
    [bankTransaction.transaction_tags],
  )

  if (!showTags && !showCustomerVendor && !showDescriptions) {
    return null
  }

  return (
    <VStack pi='md' pbe='lg' gap='md' className='Layer__bank-transaction-form-fields'>
      {showCustomerVendor && !turnOffCustomerVendor
        ? <BankTransactionCustomerVendorSelector bankTransaction={bankTransaction} />
        : null}
      {showTags && !turnOffTags
        ? (
          <TagDimensionsGroup
            value={selectedTags}
            onChange={() => { /* Tags are read-only in this context */ }}
            showLabels={true}
            isReadOnly={isReadOnly}
          />
        )
        : null}
      {showDescriptions
        ? <BankTransactionMemo bankTransactionId={bankTransaction.id} />
        : null}
    </VStack>
  )
}
