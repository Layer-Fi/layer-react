import { useCallback, useMemo } from 'react'
import type { JournalEntry } from '../../../../../../types'
import { makeTag, TagSelector, type Tag, type TagValue } from '../../../../../tags/components/TagSelector'
import { useTagLedgerEntry } from '../api/useTagLedgerEntry'
import { useRemoveTagFromLedgerEntry } from '../api/useRemoveTagFromLedgerEntry'
import { BookkeepingStatus, useEffectiveBookkeepingStatus } from '../../../../../../hooks/bookkeeping/useBookkeepingStatus'

type JournalEntryTagSelectorProps = {
  journalEntry: Pick<JournalEntry, 'id' | 'transaction_tags'>
}

export function JournalEntryTagSelector({ journalEntry }: JournalEntryTagSelectorProps) {
  const status = useEffectiveBookkeepingStatus()
  const isReadOnly = status === BookkeepingStatus.ACTIVE

  const {
    id: journalEntryId,
    transaction_tags: transactionTags,
  } = journalEntry

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

  /*
   * Note: the terms `JournalEntry` and `LedgerEntry` are not interchangeable, but have been
   * used loosely in our codebase.
   */
  const { trigger: tagJournalEntry } = useTagLedgerEntry({ ledgerEntryId: journalEntryId })
  const handleAddTag = useCallback((tag: TagValue) => {
    void tagJournalEntry({
      key: tag.dimensionLabel,
      value: tag.valueLabel,
    })
  }, [tagJournalEntry])

  const { trigger: removeTagFromJournalEntry } = useRemoveTagFromLedgerEntry({ ledgerEntryId: journalEntryId })
  const handleRemoveTag = useCallback((tag: Tag) => {
    void removeTagFromJournalEntry({
      tagId: tag.id,
    })
  }, [removeTagFromJournalEntry])

  return (
    <TagSelector
      selectedTags={selectedTags}
      isReadOnly={isReadOnly}
      menuPlacement='top'
      onAddTag={handleAddTag}
      onRemoveTag={handleRemoveTag}
    />
  )
}
