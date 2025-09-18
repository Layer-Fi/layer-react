import { useCallback, useMemo } from 'react'
import type { BankTransaction } from '../../../../../types'
import { useTagBankTransaction } from '../api/useTagBankTransaction'
import { useRemoveTagFromBankTransaction } from '../api/useRemoveTagFromBankTransaction'
import {
  useEffectiveBookkeepingStatus,
  BookkeepingStatus,
} from '../../../../../hooks/bookkeeping/useBookkeepingStatus'
import { makeTag, type Tag, type TagValue } from '../../../../tags/tagSchemas'
import { TagSelector } from '../../../../tags/components/TagSelector'

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
      dimensionLabel: dimension_display_name ?? key,
      valueLabel: value_display_name ?? value,
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
      key: tag.dimensionLabel,
      value: tag.valueLabel,
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
