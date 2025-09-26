import { fromDate, getLocalTimeZone } from '@internationalized/date'
import { LedgerEntryDirection } from '../../../schemas/generalLedger/ledgerAccount'
import type { JournalEntryForm, CreateCustomJournalEntry, JournalEntryFormLineItem, ApiCustomJournalEntryWithEntry } from './journalEntryFormSchemas'
import { BIG_DECIMAL_ZERO, convertBigDecimalToBigIntCents, convertCentsToBigDecimal } from '../../../utils/bigDecimalUtils'
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

export function getJournalEntryFormInitialValues(journalEntry: ApiCustomJournalEntryWithEntry): JournalEntryForm {
  const entryLineItemsById = new Map(journalEntry.entry.lineItems.map(lineItem => [lineItem.id, lineItem]))
  return {
    externalId: null,
    entryAt: fromDate(new Date(journalEntry.entry.entryAt), getLocalTimeZone()),
    createdBy: 'Layer React Components',
    memo: journalEntry.memo,
    customer: journalEntry.customer,
    vendor: journalEntry.vendor,
    tags: [],
    metadata: null,
    referenceNumber: '',
    lineItems: journalEntry.lineItems.map(lineItem => ({
      externalId: lineItem.externalId || null,
      accountIdentifier: {
        type: 'AccountId',
        id: entryLineItemsById.get(lineItem.id)!.account.accountId,
      },
      amount: convertCentsToBigDecimal(entryLineItemsById.get(lineItem.id)!.amount),
      direction: entryLineItemsById.get(lineItem.id)!.direction,
      memo: lineItem.memo ?? null,
      customer: lineItem.customer,
      vendor: lineItem.vendor,
      tags: [],
    })),
  }
}

export function convertJournalEntryFormToParams(form: JournalEntryForm): CreateCustomJournalEntry {
  return {
    externalId: form.externalId,
    entryAt: form.entryAt.toDate(),
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
      amount: convertBigDecimalToBigIntCents(lineItem.amount),
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

  if (!value.entryAt) {
    errors.push({ entryAt: 'Entry date is a required field.' })
  }

  if (!value.createdBy) {
    errors.push({ createdBy: 'Created by is a required field.' })
  }

  if (!value.memo) {
    errors.push({ memo: 'Memo is a required field.' })
  }

  if (!value.lineItems || value.lineItems.length === 0) {
    errors.push({ lineItems: 'At least one line item is required.' })
  }
  else {
    const debitTotal = value.lineItems
      .filter(item => item.direction === LedgerEntryDirection.Debit)
      .reduce((sum, item) => BD.sum(sum, item.amount), BIG_DECIMAL_ZERO)

    const creditTotal = value.lineItems
      .filter(item => item.direction === LedgerEntryDirection.Credit)
      .reduce((sum, item) => BD.sum(sum, item.amount), BIG_DECIMAL_ZERO)

    if (!BD.equals(debitTotal, creditTotal)) {
      errors.push({ lineItems: 'Debit and credit amounts must be equal' })
    }

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
