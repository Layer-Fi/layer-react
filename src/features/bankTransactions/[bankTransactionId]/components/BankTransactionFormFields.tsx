import { useMemo } from 'react'
import { BankTransactionMemo } from '../../../../components/BankTransactions/BankTransactionMemo/BankTransactionMemo'
import { VStack } from '../../../../components/ui/Stack/Stack'
import type { BankTransaction } from '../../../../types'
import { BankTransactionCustomerVendorSelector } from '../customerVendor/components/BankTransactionCustomerVendorSelector'
import { useBankTransactionCustomerVendorVisibility } from '../customerVendor/components/BankTransactionCustomerVendorVisibilityProvider'
import { useBankTransactionTagVisibility } from '../tags/components/BankTransactionTagVisibilityProvider'
import { TagDimensionsGroup } from '../../../../components/Journal/JournalEntryForm/TagDimensionsGroup'
import { makeTag, Tag } from '../../../tags/tagSchemas'
import {
  useEffectiveBookkeepingStatus,
  BookkeepingStatus,
} from '../../../../hooks/bookkeeping/useBookkeepingStatus'
import { useTagBankTransaction } from '../tags/api/useTagBankTransaction'
import { useRemoveTagFromBankTransaction } from '../tags/api/useRemoveTagFromBankTransaction'

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
    <VStack pi='md' pbe='lg' gap='md' className='Layer__bank-transaction-form-fields'>
      {showCustomerVendor && !turnOffCustomerVendor
        ? <BankTransactionCustomerVendorSelector bankTransaction={bankTransaction} />
        : null}
      {showTags && !turnOffTags
        ? (
          <TagDimensionsGroup
            value={selectedTags}
            onChange={handleTagsChange}
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
