import { useCallback, useMemo } from 'react'
import type { BankTransaction } from '../../../../../types'
import { makeTag, TagSelector, type Tag, type TagValue } from '../../../../tags/components/TagSelector'
import { useTagBankTransaction } from '../api/useTagBankTransaction'
import { useRemoveTagFromBankTransaction } from '../api/useRemoveTagFromBankTransaction'
import {
  useEffectiveBookkeepingStatus,
  BookkeepingStatus,
} from '../../../../../hooks/bookkeeping/useBookkeepingStatus'

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
    () => transactionTags.map(({ id, key, value, _local }) => makeTag({
      id,
      dimensionLabel: key,
      valueLabel: value,
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
