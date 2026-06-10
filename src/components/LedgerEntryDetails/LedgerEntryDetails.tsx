import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { type LedgerEntry } from '@schemas/generalLedger/ledgerEntry'
import { convertLedgerEntrySourceToLinkingMetadata, decodeLedgerEntrySource } from '@schemas/generalLedger/ledgerEntrySource'
import { humanizeEnum } from '@utils/format'
import { entryNumber } from '@utils/journal'
import { useInAppLinkContext } from '@contexts/InAppLinkContext'
import { VStack } from '@ui/Stack/Stack'
import { Badge } from '@components/Badge/Badge'
import { DateTime } from '@components/DateTime/DateTime'
import { EntryDetailField, EntryDetailSection } from '@components/LedgerEntryDetails/EntryDetailSection'
import { EntryDetailsHeader } from '@components/LedgerEntryDetails/EntryDetailsHeader'
import { LineItemsTable } from '@components/LedgerEntryDetails/LineItemsTable'
import { ReverseEntryButton } from '@components/LedgerEntryDetails/ReverseEntryButton'
import { SourceDetailView } from '@components/LedgerEntryDetails/SourceDetailView'
import { type LedgerEntryDetailsStringOverrides } from '@components/LedgerEntryDetails/types'

export interface LedgerEntryDetailsProps {
  entry?: LedgerEntry
  isLoading?: boolean
  isError?: boolean
  onClose: () => void
  /** When provided, a "Reverse entry" action is rendered for the entry. */
  onReverse?: () => Promise<void>
  stringOverrides?: LedgerEntryDetailsStringOverrides
}

export const LedgerEntryDetails = ({
  entry,
  isLoading,
  isError,
  onClose,
  onReverse,
  stringOverrides,
}: LedgerEntryDetailsProps) => {
  const { t } = useTranslation()
  const { renderInAppLink } = useInAppLinkContext()

  const ledgerEntrySource = useMemo(
    () => (entry?.source ? decodeLedgerEntrySource(entry.source) : undefined),
    [entry?.source],
  )

  const badgeOrInAppLink = useMemo(() => {
    const badgeContent = ledgerEntrySource?.entityName ?? entry?.entryType
    const defaultBadge = <Badge>{badgeContent}</Badge>
    if (!renderInAppLink || !ledgerEntrySource) {
      return defaultBadge
    }
    const linkingMetadata = convertLedgerEntrySourceToLinkingMetadata(ledgerEntrySource)
    return renderInAppLink(linkingMetadata) ?? defaultBadge
  }, [renderInAppLink, entry?.entryType, ledgerEntrySource])

  const id = entry ? entryNumber(entry) : ''

  const headerTitle = stringOverrides?.journalEntry?.header
    ? stringOverrides.journalEntry.header(id)
    : entry
      ? t('generalLedger:label.journal_entry_number', 'Journal Entry #{{entryNumber}}', { entryNumber: id })
      : t('generalLedger:label.journal_entry', 'Journal Entry')

  return (
    <VStack className='Layer__LedgerEntryDetails'>
      <EntryDetailsHeader onClose={onClose} title={headerTitle} />

      <EntryDetailSection
        title={stringOverrides?.transactionSource?.header || t('bankTransactions:label.transaction_source', 'Transaction source')}
      >
        <EntryDetailField
          label={stringOverrides?.transactionSource?.details?.sourceLabel || t('generalLedger:label.source_type', 'Source type')}
          isLoading={isLoading}
        >
          {badgeOrInAppLink}
        </EntryDetailField>
        {ledgerEntrySource && (
          <SourceDetailView
            source={ledgerEntrySource}
            stringOverrides={stringOverrides?.transactionSource?.details}
          />
        )}
      </EntryDetailSection>

      <EntryDetailSection
        title={t('generalLedger:label.entry_details', 'Entry details')}
      >
        <EntryDetailField label={t('common:label.id', 'ID')} isLoading={isLoading}>
          {id}
        </EntryDetailField>
        <EntryDetailField
          label={stringOverrides?.journalEntry?.details?.entryTypeLabel || t('generalLedger:label.entry_type', 'Entry type')}
          isLoading={isLoading}
        >
          {humanizeEnum(entry?.entryType ?? '')}
        </EntryDetailField>
        <EntryDetailField
          label={stringOverrides?.journalEntry?.details?.dateLabel || t('date:label.effective_date', 'Effective date')}
          isLoading={isLoading}
        >
          {entry?.entryAt && <DateTime valueAsDate={entry.entryAt} />}
        </EntryDetailField>
        <EntryDetailField
          label={stringOverrides?.journalEntry?.details?.creationDateLabel || t('date:label.creation_date', 'Creation date')}
          isLoading={isLoading}
        >
          {entry?.date && <DateTime valueAsDate={entry.date} />}
        </EntryDetailField>
        {entry?.reversalId && (
          <EntryDetailField
            label={stringOverrides?.journalEntry?.details?.reversalLabel || t('generalLedger:label.reversal', 'Reversal')}
            isLoading={isLoading}
            fullWidth
          >
            {t('generalLedger:label.journal_entry_number', 'Journal Entry #{{entryNumber}}', { entryNumber: entry.reversalId.substring(0, 5) })}
          </EntryDetailField>
        )}
      </EntryDetailSection>

      <EntryDetailSection
        title={stringOverrides?.lineItemsTable?.lineItemsColumnHeader || t('generalLedger:label.line_items', 'Line items')}
      >
        <LineItemsTable
          lineItems={entry?.lineItems}
          isLoading={isLoading}
          isError={isError}
          stringOverrides={stringOverrides?.lineItemsTable}
        />
      </EntryDetailSection>
      {onReverse && (
        <ReverseEntryButton onReverse={onReverse} alreadyReversed={Boolean(entry?.reversalId)} />
      )}
    </VStack>
  )
}
