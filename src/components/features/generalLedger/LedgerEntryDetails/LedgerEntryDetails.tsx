import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { type LedgerEntry } from '@schemas/features/generalLedger/ledgerEntry'
import { decodeLedgerEntrySource } from '@schemas/features/generalLedger/ledgerEntrySource'
import { entryNumber } from '@utils/features/generalLedger/journal'
import { convertLedgerEntrySourceToLinkingMetadata } from '@utils/features/generalLedger/ledgerEntrySourceLinkingMetadata'
import { humanizeEnum } from '@utils/shared/string/format'
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
  /**
   * Class names the calling feature shipped under. Journal and ledger-account details render the
   * same component now but named their elements differently before, so each passes its own.
   */
  legacyClassNames?: { root?: string, header?: string, lineItems?: string, lineItemsTable?: string }
}

export const LedgerEntryDetails = ({
  entry,
  isLoading,
  isError,
  onClose,
  onReverse,
  stringOverrides,
  legacyClassNames,
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
    ? t('generalLedger:LedgerEntryDetails.label.journal_entry_number', 'Journal Entry #{{entryNumber}}', { entryNumber: id })
    : t('generalLedger:LedgerEntryDetails.label.journal_entry', 'Journal Entry')

  const headerTitle = stringOverrides?.journalEntry?.header
    ? stringOverrides.journalEntry.header(entry ? id : undefined)
    : stringOverrides?.title ?? defaultTitle

  return (
    <VStack pbe='lg' className={legacyClassNames?.root}>
      <JournalEntryDetailHeader onClose={onClose} title={headerTitle} className={legacyClassNames?.header} />

      <LedgerEntryDetailSection
        title={stringOverrides?.transactionSource?.header || t('generalLedger:LedgerEntryDetails.label.transaction_source', 'Transaction source')}
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
        title={t('generalLedger:LedgerEntryDetails.label.entry_details', 'Entry details')}
      >
        <LedgerEntryDetailField label={t('common:label.id', 'ID')} isLoading={isLoading}>
          {id}
        </LedgerEntryDetailField>
        <LedgerEntryDetailField
          label={stringOverrides?.journalEntry?.details?.entryTypeLabel || t('generalLedger:LedgerEntryDetails.label.entry_type', 'Entry type')}
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
            label={stringOverrides?.journalEntry?.details?.reversalLabel || t('generalLedger:LedgerEntryDetails.label.reversal', 'Reversal')}
            isLoading={isLoading}
            fullWidth
          >
            {t('generalLedger:LedgerEntryDetails.label.journal_entry_number', 'Journal Entry #{{entryNumber}}', { entryNumber: entry.reversalId.substring(0, 5) })}
          </LedgerEntryDetailField>
        )}
      </LedgerEntryDetailSection>

      <LedgerEntryDetailSection
        title={stringOverrides?.lineItemsTable?.lineItemsColumnHeader || t('generalLedger:LedgerEntryDetails.label.line_items', 'Line items')}
      >
        <LedgerEntryDetailsLineItemsTable
          className={legacyClassNames?.lineItems}
          tableClassName={legacyClassNames?.lineItemsTable}
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
