import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { type LedgerEntry } from '@schemas/generalLedger/ledgerEntry'
import { decodeLedgerEntrySource } from '@schemas/generalLedger/ledgerEntrySource'
import { humanizeEnum } from '@utils/format'
import { convertLedgerEntrySourceToLinkingMetadata } from '@utils/generalLedger/ledgerEntrySourceLinkingMetadata'
import { entryNumber } from '@utils/journal'
import { useInAppLinkContext } from '@providers/common/InAppLink/InAppLinkContext'
import { Badge } from '@ui/Badge/Badge'
import { DateTime } from '@ui/DateTime/DateTime'
import { VStack } from '@ui/Stack/Stack'
import { LedgerEntryDetailField } from '@blocks/LedgerEntry/LedgerEntryDetailField/LedgerEntryDetailField'
import { LedgerEntryDetailSection } from '@blocks/LedgerEntry/LedgerEntryDetailSection/LedgerEntryDetailSection'
import { LedgerEntrySourceDetailView } from '@blocks/LedgerEntry/LedgerEntrySourceDetailView/LedgerEntrySourceDetailView'
import { JournalEntryDetailHeader } from '@features/generalLedger/JournalEntryDetailHeader/JournalEntryDetailHeader'
import { LedgerEntryDetailsLineItemsTable } from '@features/generalLedger/LedgerEntryDetails/LedgerEntryDetailsLineItemsTable'
import { ReverseLedgerEntryButton } from '@features/generalLedger/ReverseLedgerEntryButton/ReverseLedgerEntryButton'
import { type LedgerEntryDetailStringOverrides } from '@features/generalLedger/types'

export interface LedgerEntryDetailsProps {
  entry?: LedgerEntry
  isLoading?: boolean
  isError?: boolean
  onClose: () => void
  /** When provided, a "Reverse entry" action is rendered for the entry. */
  onReverse?: () => Promise<void>
  stringOverrides?: LedgerEntryDetailStringOverrides
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

  const defaultTitle = entry
    ? t('generalLedger:label.journal_entry_number', 'Journal Entry #{{entryNumber}}', { entryNumber: id })
    : t('generalLedger:label.journal_entry', 'Journal Entry')

  const headerTitle = stringOverrides?.journalEntry?.header
    ? stringOverrides.journalEntry.header(entry ? id : undefined)
    : stringOverrides?.title ?? defaultTitle

  return (
    <VStack pbe='lg'>
      <JournalEntryDetailHeader onClose={onClose} title={headerTitle} />

      <LedgerEntryDetailSection
        title={stringOverrides?.transactionSource?.header || t('bankTransactions:label.transaction_source', 'Transaction source')}
      >
        <LedgerEntryDetailField
          label={stringOverrides?.transactionSource?.details?.sourceLabel || t('common:label.source', 'Source')}
          isLoading={isLoading}
        >
          {badgeOrInAppLink}
        </LedgerEntryDetailField>
        {ledgerEntrySource && (
          <LedgerEntrySourceDetailView
            source={ledgerEntrySource}
            stringOverrides={stringOverrides?.transactionSource?.details}
          />
        )}
      </LedgerEntryDetailSection>

      <LedgerEntryDetailSection
        title={t('generalLedger:label.entry_details', 'Entry details')}
      >
        <LedgerEntryDetailField label={t('common:label.id', 'ID')} isLoading={isLoading}>
          {id}
        </LedgerEntryDetailField>
        <LedgerEntryDetailField
          label={stringOverrides?.journalEntry?.details?.entryTypeLabel || t('generalLedger:label.entry_type', 'Entry type')}
          isLoading={isLoading}
        >
          {humanizeEnum(entry?.entryType ?? '')}
        </LedgerEntryDetailField>
        <LedgerEntryDetailField
          label={stringOverrides?.journalEntry?.details?.dateLabel || t('date:label.effective_date', 'Effective date')}
          isLoading={isLoading}
        >
          {entry?.entryAt && <DateTime valueAsDate={entry.entryAt} />}
        </LedgerEntryDetailField>
        <LedgerEntryDetailField
          label={stringOverrides?.journalEntry?.details?.creationDateLabel || t('date:label.creation_date', 'Creation date')}
          isLoading={isLoading}
        >
          {entry?.date && <DateTime valueAsDate={entry.date} />}
        </LedgerEntryDetailField>
        {entry?.reversalId && (
          <LedgerEntryDetailField
            label={stringOverrides?.journalEntry?.details?.reversalLabel || t('generalLedger:label.reversal', 'Reversal')}
            isLoading={isLoading}
            fullWidth
          >
            {t('generalLedger:label.journal_entry_number', 'Journal Entry #{{entryNumber}}', { entryNumber: entry.reversalId.substring(0, 5) })}
          </LedgerEntryDetailField>
        )}
      </LedgerEntryDetailSection>

      <LedgerEntryDetailSection
        title={stringOverrides?.lineItemsTable?.lineItemsColumnHeader || t('generalLedger:label.line_items', 'Line items')}
      >
        <LedgerEntryDetailsLineItemsTable
          lineItems={entry?.lineItems}
          isLoading={isLoading}
          isError={isError}
          stringOverrides={stringOverrides?.lineItemsTable}
        />
      </LedgerEntryDetailSection>
      {onReverse && (
        <ReverseLedgerEntryButton onReverse={onReverse} alreadyReversed={Boolean(entry?.reversalId)} />
      )}
    </VStack>
  )
}
