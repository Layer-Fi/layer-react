import {
  type CustomJournalEntry,
  type CustomJournalEntryForm,
  type CustomJournalEntryFormLineItem,
  type CreateCustomJournalEntry,
} from '../../schemas/generalLedger/customJournalEntry'
import { LedgerEntryDirection } from '../../schemas/generalLedger/ledgerAccount'
import { getLocalTimeZone, fromDate } from '@internationalized/date'
import { BigDecimal as BD } from 'effect'
import { BIG_DECIMAL_ZERO, BIG_DECIMAL_ONE_HUNDRED, convertBigDecimalToCents } from '../../utils/bigDecimalUtils'

const BIG_DECIMAL_ONE_CENT = BD.unsafeDivide(BD.fromBigInt(BigInt(1)), BIG_DECIMAL_ONE_HUNDRED)

export type CustomJournalEntryFormState = {
  isDirty: boolean
  isSubmitting: boolean
}

export const EMPTY_DEBIT_LINE_ITEM: CustomJournalEntryFormLineItem = {
  accountIdentifier: null,
  amount: BIG_DECIMAL_ZERO,
  direction: LedgerEntryDirection.Debit,
  memo: '',
  customer: null,
  vendor: null,
  tagKeyValues: [],
}

export const EMPTY_CREDIT_LINE_ITEM: CustomJournalEntryFormLineItem = {
  accountIdentifier: null,
  amount: BIG_DECIMAL_ZERO,
  direction: LedgerEntryDirection.Credit,
  memo: '',
  customer: null,
  vendor: null,
  tagKeyValues: [],
}

export const getCustomJournalEntryFormDefaultValues = (): CustomJournalEntryForm => {
  const entryAt = fromDate(new Date(), getLocalTimeZone())

  return {
    entryAt,
    memo: '',
    lineItems: [EMPTY_DEBIT_LINE_ITEM, EMPTY_CREDIT_LINE_ITEM],
    customer: null,
    vendor: null,
    tagKeyValues: [],
    referenceNumber: '',
  }
}

export const getCustomJournalEntryFormInitialValues = (entry: CustomJournalEntry): CustomJournalEntryForm => {
  // TODO: Implement when we have update functionality
  // For now, return default values
  return getCustomJournalEntryFormDefaultValues()
}

export const convertCustomJournalEntryFormToParams = (form: CustomJournalEntryForm, createdBy: string): CreateCustomJournalEntry => {
  const lineItems = form.lineItems
    .filter(item => item.accountIdentifier && BD.greaterThan(item.amount, BIG_DECIMAL_ZERO))
    .map(item => ({
      accountIdentifier: item.accountIdentifier!,
      amount: convertBigDecimalToCents(item.amount),
      direction: item.direction,
      memo: item.memo || null,
      customerId: item.customer?.id || null,
      customerExternalId: item.customer?.externalId || null,
      vendorId: item.vendor?.id || null,
      vendorExternalId: item.vendor?.externalId || null,
      tagKeyValues: item.tagKeyValues?.length ? item.tagKeyValues : undefined,
      externalId: null,
    }))

  return {
    entryAt: form.entryAt.toDate(),
    createdBy,
    memo: form.memo,
    lineItems,
    customerId: form.customer?.id || null,
    customerExternalId: form.customer?.externalId || null,
    vendorId: form.vendor?.id || null,
    vendorExternalId: form.vendor?.externalId || null,
    tagKeyValues: form.tagKeyValues?.length ? form.tagKeyValues : undefined,
    referenceNumber: form.referenceNumber || null,
    metadata: null,
    externalId: null,
  }
}

export const validateCustomJournalEntryForm = (form: CustomJournalEntryForm) => {
  const errors: Record<string, string> = {}

  // Check if we have at least two line items
  const validLineItems = form.lineItems.filter(item => item.accountIdentifier && BD.greaterThan(item.amount, BIG_DECIMAL_ZERO))

  if (validLineItems.length < 2) {
    errors.lineItems = 'At least two line items with accounts and amounts are required'
  }

  // Check debit/credit balance
  const totalDebits = validLineItems
    .filter(item => item.direction === LedgerEntryDirection.Debit)
    .reduce((sum, item) => BD.sum(sum, item.amount), BIG_DECIMAL_ZERO)

  const totalCredits = validLineItems
    .filter(item => item.direction === LedgerEntryDirection.Credit)
    .reduce((sum, item) => BD.sum(sum, item.amount), BIG_DECIMAL_ZERO)

  const difference = BD.subtract(totalDebits, totalCredits)
  if (BD.greaterThan(BD.abs(difference), BIG_DECIMAL_ONE_CENT)) {
    errors.balance = 'Total debits must equal total credits'
  }

  // Validate memo
  if (!form.memo.trim()) {
    errors.memo = 'Memo is required'
  }

  return Object.keys(errors).length > 0 ? errors : undefined
}
