import { fromDate, getLocalTimeZone } from '@internationalized/date'
import { LedgerEntryDirection } from '../../../schemas/generalLedger/ledgerAccount'
import type { JournalEntryForm, CreateCustomJournalEntry, JournalEntryFormLineItem } from './journalEntryFormSchemas'
import type { JournalEntry } from '../../../types/journal'
import { BIG_DECIMAL_ZERO, convertBigDecimalToBigIntCents } from '../../../utils/bigDecimalUtils'
import { makeTagKeyValueFromTag } from '../../../features/tags/tagSchemas'
import { BigDecimal as BD } from 'effect'

export function getJournalEntryLineItemFormDefaultValues(direction: LedgerEntryDirection): JournalEntryFormLineItem {
  return {
    externalId: null,
    accountIdentifier: {
      type: 'AccountId',
      id: '',
    },
    amount: BIG_DECIMAL_ZERO,
    direction,
    memo: null,
    customer: null,
    vendor: null,
    tags: [],
  }
}

export function getJournalEntryFormDefaultValues(): JournalEntryForm {
  return {
    externalId: null,
    entryAt: fromDate(new Date(), getLocalTimeZone()),
    createdBy: '',
    memo: '',
    customer: null,
    vendor: null,
    tags: [],
    metadata: null,
    referenceNumber: '', // Changed from null to empty string to prevent input warning
    lineItems: [
      getJournalEntryLineItemFormDefaultValues(LedgerEntryDirection.Debit),
      getJournalEntryLineItemFormDefaultValues(LedgerEntryDirection.Credit),
    ],
  }
}

export function getJournalEntryFormInitialValues(journalEntry: JournalEntry): JournalEntryForm {
  return {
    externalId: null, // TODO: Extract from journal entry if available
    entryAt: fromDate(new Date(journalEntry.entry_at), getLocalTimeZone()),
    createdBy: 'Layer React Components', // TODO: Get from user context
    memo: journalEntry.source?.type === 'Manual_Ledger_Entry_Source' ? '' : '', // TODO: Extract memo from source if available
    customer: null, // TODO: Extract from journal entry if available
    vendor: null, // TODO: Extract from journal entry if available
    tags: [], // TODO: Extract from transaction_tags if available
    metadata: null,
    referenceNumber: '', // TODO: Extract from journal entry if available
    lineItems: journalEntry.line_items.map(lineItem => ({
      externalId: null,
      accountIdentifier: {
        type: 'AccountId',
        id: lineItem.account.id,
      },
      amount: BD.make(BigInt(lineItem.amount), 2), // Convert from cents to BigDecimal
      direction: lineItem.direction,
      memo: null, // TODO: Extract line item memo if available
      customer: null, // TODO: Extract from line item if available
      vendor: null, // TODO: Extract from line item if available
      tags: [], // TODO: Extract from line item tags if available
    })),
  }
}

export function convertJournalEntryFormToParams(form: JournalEntryForm): CreateCustomJournalEntry {
  return {
    externalId: form.externalId,
    entryAt: form.entryAt.toDate(), // Convert to Date - API expects date-time string
    createdBy: form.createdBy,
    memo: form.memo,
    customerId: form.customer?.id ?? null,
    customerExternalId: form.customer?.externalId ?? null,
    vendorId: form.vendor?.id ?? null,
    vendorExternalId: form.vendor?.externalId ?? null,
    tags: form.tags.map(makeTagKeyValueFromTag),
    metadata: form.metadata,
    referenceNumber: form.referenceNumber,
    lineItems: form.lineItems.map(lineItem => ({
      externalId: lineItem.externalId,
      accountIdentifier: lineItem.accountIdentifier,
      amount: convertBigDecimalToBigIntCents(lineItem.amount), // Convert to BigInt cents
      direction: lineItem.direction,
      memo: lineItem.memo,
      customerId: lineItem.customer?.id ?? null,
      customerExternalId: lineItem.customer?.externalId ?? null,
      vendorId: lineItem.vendor?.id ?? null,
      vendorExternalId: lineItem.vendor?.externalId ?? null,
      tags: lineItem.tags.map(makeTagKeyValueFromTag),
    })),
  }
}

export function validateJournalEntryForm({ value }: { value: JournalEntryForm }) {
  const errors = []

  // Validate entry date
  if (!value.entryAt) {
    errors.push({ entryAt: 'Entry date is a required field.' })
  }

  // Validate created_by
  if (!value.createdBy) {
    errors.push({ createdBy: 'Created by is a required field.' })
  }

  // Validate memo
  if (!value.memo) {
    errors.push({ memo: 'Memo is a required field.' })
  }

  // Validate line items
  if (!value.lineItems || value.lineItems.length === 0) {
    errors.push({ lineItems: 'At least one line item is required.' })
  }
  else {
    // Check for balanced entries
    const debitTotal = value.lineItems
      .filter(item => item.direction === LedgerEntryDirection.Debit)
      .reduce((sum, item) => BD.sum(sum, item.amount), BIG_DECIMAL_ZERO)

    const creditTotal = value.lineItems
      .filter(item => item.direction === LedgerEntryDirection.Credit)
      .reduce((sum, item) => BD.sum(sum, item.amount), BIG_DECIMAL_ZERO)

    if (!BD.equals(debitTotal, creditTotal)) {
      errors.push({ lineItems: 'Debit and credit amounts must be equal' })
    }

    // Validate individual line items
    value.lineItems.forEach((lineItem, index) => {
      const accountId = lineItem.accountIdentifier
      if (accountId.type === 'AccountId' && 'id' in accountId) {
        if (!accountId.id) {
          errors.push({ [`lineItems[${index}].accountIdentifier`]: 'Account is a required field.' })
        }
      }
      else if (accountId.type === 'StableName' && 'stableName' in accountId) {
        if (!accountId.stableName) {
          errors.push({ [`lineItems[${index}].accountIdentifier`]: 'Account is a required field.' })
        }
      }
      else {
        errors.push({ [`lineItems[${index}].accountIdentifier`]: 'Account is a required field.' })
      }
      if (BD.lessThan(lineItem.amount, BIG_DECIMAL_ZERO)) {
        errors.push({ [`lineItems[${index}].amount`]: 'Amount must be greater than zero.' })
      }
    })
  }

  return errors.length > 0 ? errors : null
}
