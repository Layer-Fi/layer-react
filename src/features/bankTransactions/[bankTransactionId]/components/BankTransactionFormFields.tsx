import { useMemo } from 'react'

import type { BankTransaction } from '@internal-types/bank_transactions'
import {
  BookkeepingStatus,
  useEffectiveBookkeepingStatus,
} from '@hooks/bookkeeping/useBookkeepingStatus'
import { VStack } from '@ui/Stack/Stack'
import { BankTransactionMemo } from '@components/BankTransactions/BankTransactionMemo/BankTransactionMemo'
import { BankTransactionCustomerVendorSelector } from '@features/bankTransactions/[bankTransactionId]/customerVendor/components/BankTransactionCustomerVendorSelector'
import { useBankTransactionCustomerVendorVisibility } from '@features/bankTransactions/[bankTransactionId]/customerVendor/components/BankTransactionCustomerVendorVisibilityProvider'
import { useRemoveTagFromBankTransaction } from '@features/bankTransactions/[bankTransactionId]/tags/api/useRemoveTagFromBankTransaction'
import { useTagBankTransaction } from '@features/bankTransactions/[bankTransactionId]/tags/api/useTagBankTransaction'
import { useBankTransactionTagVisibility } from '@features/bankTransactions/[bankTransactionId]/tags/components/BankTransactionTagVisibilityProvider'
import { TagDimensionsGroup } from '@features/tags/components/TagDimensionsGroup'
import { makeTag, type Tag } from '@features/tags/tagSchemas'

type BankTransactionFormFieldProps = {
  bankTransaction: Pick<
    BankTransaction,
    'id' | 'transaction_tags' | 'customer' | 'vendor'
  >
  showDescriptions?: boolean
  hideTags?: boolean
  hideCustomerVendor?: boolean
}

export function BankTransactionFormFields({
  bankTransaction,
  showDescriptions,
  hideTags = false,
  hideCustomerVendor = false,
}: BankTransactionFormFieldProps) {
  const { showTags } = useBankTransactionTagVisibility()
  const { showCustomerVendor } = useBankTransactionCustomerVendorVisibility()
  const status = useEffectiveBookkeepingStatus()
  const isReadOnly = status === BookkeepingStatus.ACTIVE

  // Hooks for auto-saving tags
  const { trigger: tagBankTransaction } = useTagBankTransaction({ bankTransactionId: bankTransaction.id })
  const { trigger: removeTagFromBankTransaction } = useRemoveTagFromBankTransaction({ bankTransactionId: bankTransaction.id })

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

  const handleTagsChange = (newTags: readonly Tag[]) => {
    const oldTags = selectedTags

    // Find tags that were added
    const addedTags = newTags.filter(newTag =>
      !oldTags.some(oldTag => oldTag.key === newTag.key && oldTag.value === newTag.value),
    )

    // Find tags that were removed
    const removedTags = oldTags.filter(oldTag =>
      !newTags.some(newTag => newTag.key === oldTag.key && newTag.value === oldTag.value),
    )

    // Trigger API calls for added tags
    addedTags.forEach((tag) => {
      void tagBankTransaction({
        key: tag.key,
        value: tag.value,
        dimensionDisplayName: tag.dimensionDisplayName,
        valueDisplayName: tag.valueDisplayName,
      })
    })

    // Trigger API calls for removed tags
    removedTags.forEach((tag) => {
      void removeTagFromBankTransaction({
        tagId: tag.id,
      })
    })
  }

  if (!showTags && !showCustomerVendor && !showDescriptions) {
    return null
  }

  return (
    <VStack gap='md'>
      {showCustomerVendor && !hideCustomerVendor
        && <BankTransactionCustomerVendorSelector bankTransaction={bankTransaction} />}
      {showTags && !hideTags
        && (
          <TagDimensionsGroup
            value={selectedTags}
            onChange={handleTagsChange}
            showLabels={true}
            isReadOnly={isReadOnly}
          />
        )}
      {showDescriptions
        && (
          <VStack gap='sm'>
            <BankTransactionMemo bankTransactionId={bankTransaction.id} />
          </VStack>
        )}
    </VStack>
  )
}
