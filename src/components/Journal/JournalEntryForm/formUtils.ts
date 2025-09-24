import { fromDate, getLocalTimeZone } from '@internationalized/date'
import { LedgerEntryDirection } from '../../../schemas/generalLedger/ledgerAccount'
import type { JournalEntryForm, CreateCustomJournalEntry, JournalEntryFormLineItem } from './journalEntryFormSchemas'
import type { JournalEntry } from '../../../types/journal'
import { makeAccountId, makeStableName } from '../../../schemas/accountIdentifier'
import { BIG_DECIMAL_ZERO } from '../../../utils/bigDecimalUtils'

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
        type: lineItem.account.type,
        stable_name: lineItem.account.stable_name,
        id: lineItem.account.id,
        name: lineItem.account.name,
        subType: lineItem.account.subtype
          ? {
            value: lineItem.account.subtype.value,
            label: lineItem.account.subtype.display_name,
          }
          : undefined,
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
    entryAt: form.entryAt?.toAbsoluteString() || new Date().toISOString(),
    createdBy: form.createdBy,
    memo: form.memo,
    customerId: form.customerId,
    customerExternalId: form.customerExternalId,
    vendorId: form.vendorId,
    vendorExternalId: form.vendorExternalId,
    tags: form.tags,
    metadata: form.metadata,
    referenceNumber: form.referenceNumber,
    lineItems: form.lineItems.map(lineItem => ({
      externalId: lineItem.externalId,
      accountIdentifier: convertAccountIdentifier(lineItem.accountIdentifier),
      amount: BigInt(Math.round(lineItem.amount * 100)), // Convert to BigInt cents
      direction: lineItem.direction,
      memo: lineItem.memo,
      customerId: lineItem.customerId,
      customerExternalId: lineItem.customerExternalId,
      vendorId: lineItem.vendorId,
      vendorExternalId: lineItem.vendorExternalId,
      tags: lineItem.tags,
    })),
  }
}

// Helper function to convert form account identifier to API AccountIdentifier schema
function convertAccountIdentifier(formAccountIdentifier: JournalEntryFormLineItem['accountIdentifier']) {
  if (formAccountIdentifier.type === 'StableName' && 'stableName' in formAccountIdentifier) {
    return formAccountIdentifier
  }
  else if (formAccountIdentifier.type === 'AccountId' && 'id' in formAccountIdentifier) {
    return formAccountIdentifier
  }
  else {
    // Legacy support for the old form structure
    if ((formAccountIdentifier as any).stable_name) {
      return makeStableName((formAccountIdentifier as any).stable_name)
    }
    else {
      return makeAccountId((formAccountIdentifier as any).id)
    }
  }
}

export function validateJournalEntryForm({ value }: { value: JournalEntryForm }) {
  const errors: Record<string, string> = {}

  // Validate entry date
  if (!value.entryAt) {
    errors.entryAt = 'Entry date is required'
  }

  // Validate created_by
  if (!value.createdBy) {
    errors.createdBy = 'Created by is required'
  }

  // Validate memo
  if (!value.memo) {
    errors.memo = 'Memo is required'
  }

  // Validate line items
  if (!value.lineItems || value.lineItems.length === 0) {
    errors.lineItems = 'At least one line item is required'
  }
  else {
    // Check for balanced entries
    const debitTotal = value.lineItems
      .filter(item => item.direction === LedgerEntryDirection.Debit)
      .reduce((sum, item) => sum + item.amount, 0)

    const creditTotal = value.lineItems
      .filter(item => item.direction === LedgerEntryDirection.Credit)
      .reduce((sum, item) => sum + item.amount, 0)

    if (Math.abs(debitTotal - creditTotal) > 0.01) { // Allow for small rounding differences
      errors.lineItems = 'Debit and credit amounts must be equal'
    }

    // Validate individual line items
    value.lineItems.forEach((lineItem, index) => {
      const accountId = lineItem.accountIdentifier
      if (accountId.type === 'AccountId' && 'id' in accountId) {
        if (!accountId.id) {
          errors[`lineItems.${index}.accountIdentifier`] = 'Account is required'
        }
      }
      else if (accountId.type === 'StableName' && 'stableName' in accountId) {
        if (!accountId.stableName) {
          errors[`lineItems.${index}.accountIdentifier`] = 'Account is required'
        }
      }
      else {
        // Legacy support
        const legacyAccountId = accountId as any
        if (!legacyAccountId.id && !legacyAccountId.stable_name) {
          errors[`lineItems.${index}.accountIdentifier`] = 'Account is required'
        }
      }
      if (lineItem.amount <= 0) {
        errors[`lineItems.${index}.amount`] = 'Amount must be greater than zero'
      }
    })
  }

  return errors
}
