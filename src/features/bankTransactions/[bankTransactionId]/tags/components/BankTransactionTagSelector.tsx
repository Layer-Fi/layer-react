import { useCallback, useMemo } from 'react'

import type { BankTransaction } from '@internal-types/bank_transactions'
import {
  BookkeepingStatus,
  useEffectiveBookkeepingStatus,
} from '@hooks/bookkeeping/useBookkeepingStatus'
import { useRemoveTagFromBankTransaction } from '@features/bankTransactions/[bankTransactionId]/tags/api/useRemoveTagFromBankTransaction'
import { useTagBankTransaction } from '@features/bankTransactions/[bankTransactionId]/tags/api/useTagBankTransaction'
import { TagSelector } from '@features/tags/components/TagSelector'
import { makeTag, type Tag, type TagValue } from '@features/tags/tagSchemas'

type BankTransactionTagSelectorProps = {
  bankTransaction: Pick<BankTransaction, 'id' | 'transaction_tags'>
}

export function BankTransactionTagSelector({ bankTransaction }: BankTransactionTagSelectorProps) {
  const status = useEffectiveBookkeepingStatus()
  const isReadOnly = status === BookkeepingStatus.ACTIVE

  const {
    id: bankTransactionId,
    transaction_tags: transactionTags,
  } = bankTransaction

  const selectedTags = useMemo(
    () => transactionTags.map(({ id, key, value, dimension_display_name, value_display_name, archived_at, _local }) => makeTag({
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
    [transactionTags],
  )

  const { trigger: tagBankTransaction } = useTagBankTransaction({ bankTransactionId })
  const handleAddTag = useCallback((tag: TagValue) => {
    void tagBankTransaction({
      key: tag.dimensionKey,
      dimensionDisplayName: tag.dimensionDisplayName,
      value: tag.value,
      valueDisplayName: tag.valueDisplayName,
    })
  }, [tagBankTransaction])

  const { trigger: removeTagFromBankTransaction } = useRemoveTagFromBankTransaction({ bankTransactionId })
  const handleRemoveTag = useCallback((tag: Tag) => {
    void removeTagFromBankTransaction({
      tagId: tag.id,
    })
  }, [removeTagFromBankTransaction])

  return (
    <TagSelector
      selectedTags={selectedTags}
      isReadOnly={isReadOnly}
      onAddTag={handleAddTag}
      onRemoveTag={handleRemoveTag}
    />
  )
}
