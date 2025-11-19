import { fromDate, getLocalTimeZone } from '@internationalized/date'
import { BigDecimal as BD } from 'effect'

import { LedgerEntryDirection } from '@schemas/generalLedger/ledgerAccount'
import { BIG_DECIMAL_ZERO, convertBigDecimalToBigIntCents, convertCentsToBigDecimal } from '@utils/bigDecimalUtils'
import type { ApiCustomJournalEntryWithEntry, CreateCustomJournalEntry, JournalEntryForm, JournalEntryFormLineItem } from '@components/Journal/JournalEntryForm/journalEntryFormSchemas'
import { makeTagFromTransactionTag, makeTagKeyValueFromTag } from '@features/tags/tagSchemas'

/**
 * Determines if a line item is blank (empty).
 * A line item is considered blank if:
 * - It has no account selected (empty id)
 * - Amount is 0
 * - No other fields are populated (memo, customer, vendor, tags, externalId)
 */
export function isLineItemBlank(lineItem: JournalEntryFormLineItem): boolean {
  const hasAccount = lineItem.accountIdentifier.type === 'AccountId'
    ? Boolean(lineItem.accountIdentifier.id)
    : lineItem.accountIdentifier.type === 'StableName'
      ? Boolean(lineItem.accountIdentifier.stableName)
      : false

  const hasAmount = !BD.equals(lineItem.amount, BIG_DECIMAL_ZERO)
  const hasMemo = Boolean(lineItem.memo?.trim())
  const hasCustomer = Boolean(lineItem.customer)
  const hasVendor = Boolean(lineItem.vendor)
  const hasTags = lineItem.tags.length > 0
  const hasExternalId = Boolean(lineItem.externalId)

  return !hasAccount && !hasAmount && !hasMemo && !hasCustomer && !hasVendor && !hasTags && !hasExternalId
}

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
    createdBy: '',
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
      tags: lineItem.transactionTags?.map(makeTagFromTransactionTag) ?? [],
    })),
  }
}

export function convertJournalEntryFormToParams(form: JournalEntryForm): CreateCustomJournalEntry {
  const trimmedReferenceNumber = form.referenceNumber?.trim()

  // Filter out blank line items before converting
  const nonBlankLineItems = form.lineItems.filter(lineItem => !isLineItemBlank(lineItem))

  return {
    ...(form.externalId && { externalId: form.externalId }),
    entryAt: form.entryAt.toDate(),
    createdBy: form.createdBy,
    memo: form.memo.trim(),
    ...(form.customer?.id && { customerId: form.customer.id }),
    ...(form.customer?.externalId && { customerExternalId: form.customer.externalId }),
    ...(form.vendor?.id && { vendorId: form.vendor.id }),
    ...(form.vendor?.externalId && { vendorExternalId: form.vendor.externalId }),
    ...(form.tags.length > 0 && { tags: form.tags.map(makeTagKeyValueFromTag) }),
    ...(form.metadata !== null && { metadata: form.metadata }),
    ...(trimmedReferenceNumber && { referenceNumber: trimmedReferenceNumber }),
    lineItems: nonBlankLineItems.map(lineItem => ({
      ...(lineItem.externalId && { externalId: lineItem.externalId }),
      accountIdentifier: lineItem.accountIdentifier,
      amount: convertBigDecimalToBigIntCents(lineItem.amount),
      direction: lineItem.direction,
      ...(lineItem.memo?.trim() && { memo: lineItem.memo.trim() }),
      ...(lineItem.customer?.id && { customerId: lineItem.customer.id }),
      ...(lineItem.customer?.externalId && { customerExternalId: lineItem.customer.externalId }),
      ...(lineItem.vendor?.id && { vendorId: lineItem.vendor.id }),
      ...(lineItem.vendor?.externalId && { vendorExternalId: lineItem.vendor.externalId }),
      ...(lineItem.tags.length > 0 && { tags: lineItem.tags.map(makeTagKeyValueFromTag) }),
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

  // Filter out blank line items for validation
  const nonBlankLineItems = value.lineItems.filter(lineItem => !isLineItemBlank(lineItem))

  if (!value.lineItems || nonBlankLineItems.length === 0) {
    errors.push({ lineItems: 'At least one line item is required.' })
  }
  else {
    const nonBlankDebits = nonBlankLineItems.filter(item => item.direction === LedgerEntryDirection.Debit)
    const nonBlankCredits = nonBlankLineItems.filter(item => item.direction === LedgerEntryDirection.Credit)

    if (nonBlankDebits.length === 0) {
      errors.push({ lineItems: 'At least one debit line item is required.' })
    }

    if (nonBlankCredits.length === 0) {
      errors.push({ lineItems: 'At least one credit line item is required.' })
    }

    const debitTotal = nonBlankDebits.reduce((sum, item) => BD.sum(sum, item.amount), BIG_DECIMAL_ZERO)
    const creditTotal = nonBlankCredits.reduce((sum, item) => BD.sum(sum, item.amount), BIG_DECIMAL_ZERO)

    if (!BD.equals(debitTotal, creditTotal)) {
      errors.push({ lineItems: 'Debit and credit amounts must be equal' })
    }

    value.lineItems.forEach((lineItem, index) => {
      // Skip validation for blank line items
      if (isLineItemBlank(lineItem)) {
        return
      }

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
