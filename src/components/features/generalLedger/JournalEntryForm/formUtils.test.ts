import { fromDate, getLocalTimeZone } from '@internationalized/date'
import type { TFunction } from 'i18next'
import { describe, expect, it } from 'vitest'

import { makeNonRecursiveBigDecimal, NRBD_ZERO } from '@schemas/common/nonRecursiveBigDecimal'
import { type ApiCustomJournalEntryWithEntry } from '@schemas/features/generalLedger/journalEntry'
import { type JournalEntryForm, type JournalEntryFormLineItem } from '@schemas/features/generalLedger/journalEntryForm'
import { LedgerEntryDirection } from '@schemas/features/generalLedger/ledgerEntryDirection'
import { makeTag } from '@schemas/features/tags/tag'
import {
  convertJournalEntryFormToParams,
  getJournalEntryFormDefaultValues,
  getJournalEntryFormInitialValues,
  getJournalEntryLineItemFormDefaultValues,
  isLineItemBlank,
  validateJournalEntryForm,
} from '@features/generalLedger/JournalEntryForm/formUtils'

import { makeChartAccount } from '@fixtures/chartOfAccounts/mocks'
import { makeCustomer } from '@fixtures/customers/mocks'
import { makeVendor } from '@fixtures/vendors/mocks'
import { setupFakeSystemTime } from '@testUtils/dates/fakeSystemTime'
import { NOW } from '@testUtils/dates/fixedDates'

const t = ((_key: string, defaultValue: string) => defaultValue) as TFunction

const makeBlankLineItem = (overrides: Partial<JournalEntryFormLineItem> = {}): JournalEntryFormLineItem => ({
  ...getJournalEntryLineItemFormDefaultValues(LedgerEntryDirection.Debit),
  ...overrides,
})

const makeFilledForm = (overrides: Partial<JournalEntryForm> = {}): JournalEntryForm => ({
  ...getJournalEntryFormDefaultValues(),
  createdBy: 'Ada Lovelace',
  memo: 'Office supplies',
  lineItems: [
    makeBlankLineItem({
      accountIdentifier: { type: 'AccountId', id: 'account-debit' },
      amount: makeNonRecursiveBigDecimal({ value: 10000n, scale: 2 }),
      direction: LedgerEntryDirection.Debit,
    }),
    makeBlankLineItem({
      accountIdentifier: { type: 'AccountId', id: 'account-credit' },
      amount: makeNonRecursiveBigDecimal({ value: 10000n, scale: 2 }),
      direction: LedgerEntryDirection.Credit,
    }),
  ],
  ...overrides,
})

describe('isLineItemBlank', () => {
  it('returns true for a line item with no account, amount, or other fields', () => {
    expect(isLineItemBlank(getJournalEntryLineItemFormDefaultValues(LedgerEntryDirection.Debit))).toBe(true)
  })

  it('returns false when an account is selected', () => {
    const lineItem = makeBlankLineItem({ accountIdentifier: { type: 'AccountId', id: 'account-1' } })
    expect(isLineItemBlank(lineItem)).toBe(false)
  })

  it('returns false when an amount is set', () => {
    const lineItem = makeBlankLineItem({ amount: makeNonRecursiveBigDecimal({ value: 500n, scale: 2 }) })
    expect(isLineItemBlank(lineItem)).toBe(false)
  })

  it('returns false when a memo is set', () => {
    const lineItem = makeBlankLineItem({ memo: 'Refund' })
    expect(isLineItemBlank(lineItem)).toBe(false)
  })

  it('returns false when tags are present', () => {
    const tag = makeTag({
      id: '00000000-0000-4000-8000-000000000010',
      key: 'department',
      dimensionDisplayName: 'Department',
      value: 'engineering',
      valueDisplayName: 'Engineering',
      archivedAt: null,
      _local: { isOptimistic: false },
    })
    expect(isLineItemBlank(makeBlankLineItem({ tags: [tag] }))).toBe(false)
  })
})

describe('getJournalEntryLineItemFormDefaultValues', () => {
  it('returns an empty line item in the requested direction', () => {
    expect(getJournalEntryLineItemFormDefaultValues(LedgerEntryDirection.Credit)).toEqual({
      externalId: null,
      accountIdentifier: { type: 'AccountId', id: '' },
      amount: NRBD_ZERO,
      direction: LedgerEntryDirection.Credit,
      memo: null,
      customer: null,
      vendor: null,
      tags: [],
    })
  })
})

describe('getJournalEntryFormDefaultValues', () => {
  setupFakeSystemTime(NOW)

  it('seeds one blank debit line and one blank credit line, dated now', () => {
    const defaults = getJournalEntryFormDefaultValues()

    expect(defaults.entryAt.toDate()).toEqual(fromDate(NOW, getLocalTimeZone()).toDate())
    expect(defaults.createdBy).toBe('')
    expect(defaults.memo).toBe('')
    expect(defaults.lineItems).toHaveLength(2)
    expect(defaults.lineItems[0]?.direction).toBe(LedgerEntryDirection.Debit)
    expect(defaults.lineItems[1]?.direction).toBe(LedgerEntryDirection.Credit)
  })
})

describe('getJournalEntryFormInitialValues', () => {
  it('prefills the form from an existing custom journal entry', () => {
    const customer = makeCustomer()
    const vendor = makeVendor()
    const account = makeChartAccount()

    const journalEntry: ApiCustomJournalEntryWithEntry = {
      id: '00000000-0000-4000-8000-000000000100',
      externalId: null,
      createdBy: 'Ada Lovelace',
      memo: 'Client invoice',
      entryId: '00000000-0000-4000-8000-000000000101',
      customer,
      vendor: null,
      lineItems: [
        {
          id: '00000000-0000-4000-8000-000000000102',
          externalId: 'ext-1',
          memo: 'Line memo',
          lineItemId: '00000000-0000-4000-8000-000000000103',
          customer: null,
          vendor,
          transactionTags: null,
        },
      ],
      entry: {
        entryId: '00000000-0000-4000-8000-000000000101',
        businessId: '00000000-0000-4000-8000-000000000001',
        ledgerId: '00000000-0000-4000-8000-0000000000ff',
        entryNumber: 42,
        agent: null,
        entryType: null,
        customer: null,
        vendor: null,
        createdAt: new Date('2026-06-01T00:00:00.000Z'),
        entryAt: new Date('2026-06-01T00:00:00.000Z'),
        reversalOfId: null,
        reversalId: null,
        lineItems: [
          {
            id: '00000000-0000-4000-8000-000000000102',
            entryId: '00000000-0000-4000-8000-000000000101',
            account,
            amount: 12345,
            direction: LedgerEntryDirection.Debit,
            customer: null,
            vendor: null,
            entryAt: new Date('2026-06-01T00:00:00.000Z'),
            createdAt: new Date('2026-06-01T00:00:00.000Z'),
            entryReversalOf: null,
            entryReversedBy: null,
          },
        ],
        transactionTags: [],
        memo: 'Client invoice',
        metadata: null,
        referenceNumber: null,
      },
      transactionTags: [],
      metadata: null,
      referenceNumber: null,
    }

    const result = getJournalEntryFormInitialValues(journalEntry)

    expect(result.memo).toBe('Client invoice')
    expect(result.customer).toBe(customer)
    expect(result.vendor).toBeNull()
    expect(result.lineItems).toHaveLength(1)
    expect(result.lineItems[0]).toMatchObject({
      externalId: 'ext-1',
      accountIdentifier: { type: 'AccountId', id: account.accountId },
      direction: LedgerEntryDirection.Debit,
      memo: 'Line memo',
      vendor,
      customer: null,
      tags: [],
    })
  })
})

describe('convertJournalEntryFormToParams', () => {
  it('converts a filled-in form into create params, dropping blank line items', () => {
    const customer = makeCustomer()
    const form = makeFilledForm({
      customer,
      lineItems: [
        makeBlankLineItem({
          accountIdentifier: { type: 'AccountId', id: 'account-debit' },
          amount: makeNonRecursiveBigDecimal({ value: 10000n, scale: 2 }),
          direction: LedgerEntryDirection.Debit,
        }),
        makeBlankLineItem({
          accountIdentifier: { type: 'AccountId', id: 'account-credit' },
          amount: makeNonRecursiveBigDecimal({ value: 10000n, scale: 2 }),
          direction: LedgerEntryDirection.Credit,
        }),
        getJournalEntryLineItemFormDefaultValues(LedgerEntryDirection.Debit),
      ],
    })

    const params = convertJournalEntryFormToParams(form)

    expect(params.createdBy).toBe('Ada Lovelace')
    expect(params.memo).toBe('Office supplies')
    expect(params.customerId).toBe(customer.id)
    expect(params).not.toHaveProperty('vendorId')
    expect(params.lineItems).toHaveLength(2)
    expect(params.lineItems.map(lineItem => lineItem.direction)).toEqual([
      LedgerEntryDirection.Debit,
      LedgerEntryDirection.Credit,
    ])
    expect(params.lineItems[0]).not.toHaveProperty('memo')
  })

  it('trims the reference number and omits it when blank', () => {
    const form = makeFilledForm({ referenceNumber: '  ' })

    const params = convertJournalEntryFormToParams(form)

    expect(params).not.toHaveProperty('referenceNumber')
  })
})

describe('validateJournalEntryForm', () => {
  it('returns no errors for a valid, balanced form', () => {
    const form = makeFilledForm()
    expect(validateJournalEntryForm({ value: form }, t)).toBeNull()
  })

  it('requires created by, memo, and at least one debit and credit line', () => {
    const form = makeFilledForm({
      createdBy: '',
      memo: '',
      lineItems: [getJournalEntryLineItemFormDefaultValues(LedgerEntryDirection.Debit)],
    })

    const errors = validateJournalEntryForm({ value: form }, t)

    expect(errors).toEqual(expect.arrayContaining([
      { createdBy: 'Created by is a required field.' },
      { memo: 'Memo is a required field.' },
      { lineItems: 'At least one line item is required.' },
    ]))
  })

  it('flags unbalanced debits and credits', () => {
    const form = makeFilledForm({
      lineItems: [
        makeBlankLineItem({
          accountIdentifier: { type: 'AccountId', id: 'account-debit' },
          amount: makeNonRecursiveBigDecimal({ value: 10000n, scale: 2 }),
          direction: LedgerEntryDirection.Debit,
        }),
        makeBlankLineItem({
          accountIdentifier: { type: 'AccountId', id: 'account-credit' },
          amount: makeNonRecursiveBigDecimal({ value: 5000n, scale: 2 }),
          direction: LedgerEntryDirection.Credit,
        }),
      ],
    })

    const errors = validateJournalEntryForm({ value: form }, t)

    expect(errors).toEqual(expect.arrayContaining([
      { lineItems: 'Debit and credit amounts must be equal' },
    ]))
  })
})
