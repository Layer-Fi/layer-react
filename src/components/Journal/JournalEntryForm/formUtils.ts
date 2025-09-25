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
    customerId: null,
    customerExternalId: null,
    vendorId: null,
    vendorExternalId: null,
    tags: [],
  }
}

export function getJournalEntryFormDefaultValues(): JournalEntryForm {
  return {
    externalId: null,
    entryAt: fromDate(new Date(), getLocalTimeZone()),
    createdBy: '',
    memo: '',
    customerId: null,
    customerExternalId: null,
    vendorId: null,
    vendorExternalId: null,
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
    customerId: null, // TODO: Extract from journal entry if available
    customerExternalId: null,
    vendorId: null, // TODO: Extract from journal entry if available
    vendorExternalId: null,
    tags: [], // TODO: Extract from transaction_tags if available
    metadata: null,
    referenceNumber: '', // TODO: Extract from journal entry if available
    lineItems: journalEntry.line_items.map(lineItem => ({
      externalId: null,
      accountIdentifier: {
        type: 'AccountId',
        id: lineItem.account.id,
      },
      amount: lineItem.amount / 100, // Convert from cents
      direction: lineItem.direction,
      memo: null, // TODO: Extract line item memo if available
      customerId: null,
      customerExternalId: null,
      vendorId: null,
      vendorExternalId: null,
      tags: [], // TODO: Extract from line item tags if available
      // Legacy fields for backward compatibility
      job: null, // TODO: Extract job from transaction tags if available
      description: '', // TODO: Extract description if available
    })),
    // Legacy field for backward compatibility
    notes: '', // TODO: Extract notes if available
  }
}

export function convertJournalEntryFormToParams(form: JournalEntryForm): CreateCustomJournalEntry {
  return {
    externalId: form.externalId,
    entryAt: form.entryAt.toDate(), // Convert to Date - API expects date-time string
    createdBy: form.createdBy,
    memo: form.memo,
    customerId: form.customerId,
    customerExternalId: form.customerExternalId,
    vendorId: form.vendorId,
    vendorExternalId: form.vendorExternalId,
    tags: form.tags.map(makeTagKeyValueFromTag),
    metadata: form.metadata,
    referenceNumber: form.referenceNumber,
    lineItems: form.lineItems.map(lineItem => ({
      externalId: lineItem.externalId,
      accountIdentifier: lineItem.accountIdentifier,
      amount: convertBigDecimalToBigIntCents(lineItem.amount), // Convert to BigInt cents
      direction: lineItem.direction,
      memo: lineItem.memo,
      customerId: lineItem.customerId,
      customerExternalId: lineItem.customerExternalId,
      vendorId: lineItem.vendorId,
      vendorExternalId: lineItem.vendorExternalId,
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
