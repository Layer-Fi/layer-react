import { fromDate, getLocalTimeZone } from '@internationalized/date'
import { BigDecimal as BD } from 'effect'
import type { TFunction } from 'i18next'
import { describe, expect, it } from 'vitest'

import { makeAccountId } from '@schemas/common/accountIdentifier'
import { convertCentsToNonRecursiveBigDecimal, toNonRecursiveBigDecimal } from '@schemas/common/nonRecursiveBigDecimal'
import type { ApiCustomJournalEntryWithEntry, ApiLedgerEntry } from '@schemas/features/generalLedger/journalEntry'
import type { JournalEntryForm, JournalEntryFormLineItem } from '@schemas/features/generalLedger/journalEntryForm'
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

const t = ((_key: string, defaultValue: string) => defaultValue) as unknown as TFunction

const BLANK_LINE_ITEM: JournalEntryFormLineItem = getJournalEntryLineItemFormDefaultValues(LedgerEntryDirection.Debit)

const buildLineItem = (overrides: Partial<JournalEntryFormLineItem> = {}): JournalEntryFormLineItem => ({
  ...getJournalEntryLineItemFormDefaultValues(LedgerEntryDirection.Debit),
  accountIdentifier: makeAccountId('account-1'),
  amount: convertCentsToNonRecursiveBigDecimal(1000),
  ...overrides,
})

const buildForm = (overrides: Partial<JournalEntryForm> = {}): JournalEntryForm => ({
  ...getJournalEntryFormDefaultValues(),
  createdBy: 'Jane Doe',
  memo: 'Rent payment',
  lineItems: [
    buildLineItem({ direction: LedgerEntryDirection.Debit }),
    buildLineItem({ direction: LedgerEntryDirection.Credit }),
  ],
  ...overrides,
})

describe('isLineItemBlank', () => {
  it('treats a line item with no account, amount, or other fields as blank', () => {
    expect(isLineItemBlank(BLANK_LINE_ITEM)).toBe(true)
  })

  it('treats a line item with an account selected as non-blank', () => {
    expect(isLineItemBlank({ ...BLANK_LINE_ITEM, accountIdentifier: makeAccountId('account-1') })).toBe(false)
  })

  it('treats a line item with a non-zero amount as non-blank', () => {
    expect(isLineItemBlank({ ...BLANK_LINE_ITEM, amount: convertCentsToNonRecursiveBigDecimal(500) })).toBe(false)
  })

  it('treats a line item with only a memo as non-blank', () => {
    expect(isLineItemBlank({ ...BLANK_LINE_ITEM, memo: 'note' })).toBe(false)
  })

  it('treats a line item with only tags as non-blank', () => {
    const tag = makeTag({
      id: '00000000-0000-4000-8000-000000000701',
      key: 'department',
      value: 'sales',
      dimensionDisplayName: null,
      valueDisplayName: null,
      archivedAt: null,
      _local: { isOptimistic: false },
    })
    expect(isLineItemBlank({ ...BLANK_LINE_ITEM, tags: [tag] })).toBe(false)
  })
})

describe('getJournalEntryFormDefaultValues', () => {
  it('returns one blank debit and one blank credit line item', () => {
    const form = getJournalEntryFormDefaultValues()

    expect(form.lineItems).toHaveLength(2)
    expect(form.lineItems[0].direction).toBe(LedgerEntryDirection.Debit)
    expect(form.lineItems[1].direction).toBe(LedgerEntryDirection.Credit)
    expect(form.memo).toBe('')
    expect(form.customer).toBeNull()
    expect(form.vendor).toBeNull()
  })
})

describe('getJournalEntryFormInitialValues', () => {
  it('prefills form fields, including line items, from an existing journal entry', () => {
    const customer = makeCustomer()
    const vendor = makeVendor()
    const account = makeChartAccount()
    const ledgerEntry: ApiLedgerEntry = {
      entryId: '00000000-0000-4000-8000-000000000900',
      businessId: '00000000-0000-4000-8000-000000000001',
      ledgerId: '00000000-0000-4000-8000-0000000000ff',
      entryNumber: 1001,
      agent: 'LAYER_MANUAL',
      entryType: 'MANUAL',
      customer: null,
      vendor: null,
      createdAt: new Date('2026-01-15T00:00:00.000Z'),
      entryAt: new Date('2026-01-15T00:00:00.000Z'),
      reversalOfId: null,
      reversalId: null,
      lineItems: [
        {
          id: '00000000-0000-4000-8000-000000000901',
          entryId: '00000000-0000-4000-8000-000000000900',
          account,
          amount: 2500,
          direction: LedgerEntryDirection.Debit,
          customer: null,
          vendor: null,
          entryAt: new Date('2026-01-15T00:00:00.000Z'),
          createdAt: new Date('2026-01-15T00:00:00.000Z'),
          entryReversalOf: null,
          entryReversedBy: null,
        },
      ],
      transactionTags: [],
      memo: 'Opening entry',
      metadata: null,
      referenceNumber: null,
    }

    const journalEntry: ApiCustomJournalEntryWithEntry = {
      id: '00000000-0000-4000-8000-000000000900',
      externalId: null,
      createdBy: 'jane@example.com',
      memo: 'Opening entry',
      entryId: '00000000-0000-4000-8000-000000000900',
      customer,
      vendor,
      lineItems: [
        {
          id: '00000000-0000-4000-8000-000000000901',
          externalId: 'ext-1',
          memo: 'line memo',
          lineItemId: '00000000-0000-4000-8000-000000000901',
          customer: null,
          vendor: null,
          transactionTags: null,
        },
      ],
      entry: ledgerEntry,
      transactionTags: [],
      metadata: null,
      referenceNumber: null,
    }

    const form = getJournalEntryFormInitialValues(journalEntry)

    expect(form.memo).toBe('Opening entry')
    expect(form.customer).toEqual(customer)
    expect(form.vendor).toEqual(vendor)
    expect(form.lineItems).toHaveLength(1)
    expect(form.lineItems[0].externalId).toBe('ext-1')
    expect(form.lineItems[0].memo).toBe('line memo')
    expect(form.lineItems[0].direction).toBe(LedgerEntryDirection.Debit)
    expect(form.lineItems[0].accountIdentifier).toEqual({ type: 'AccountId', id: account.accountId })
    expect(form.lineItems[0].amount).toEqual(toNonRecursiveBigDecimal(BD.unsafeFromString('25')))
  })
})

describe('convertJournalEntryFormToParams', () => {
  it('converts a form into request params and drops blank line items', () => {
    const form = buildForm({
      externalId: 'entry-ext-id',
      entryAt: fromDate(new Date('2026-02-01T00:00:00.000Z'), getLocalTimeZone()),
      referenceNumber: '  INV-1  ',
      lineItems: [
        buildLineItem({ direction: LedgerEntryDirection.Debit }),
        buildLineItem({ direction: LedgerEntryDirection.Credit }),
        BLANK_LINE_ITEM,
      ],
    })

    const params = convertJournalEntryFormToParams(form)

    expect(params.externalId).toBe('entry-ext-id')
    expect(params.createdBy).toBe('Jane Doe')
    expect(params.memo).toBe('Rent payment')
    expect(params.referenceNumber).toBe('INV-1')
    expect(params.lineItems).toHaveLength(2)
    expect(params.lineItems[0].amount).toBe(BigInt(1000))
    expect(params.lineItems[0].direction).toBe(LedgerEntryDirection.Debit)
  })

  it('omits optional fields when the form leaves them unset', () => {
    const form = buildForm({ referenceNumber: '' })

    const params = convertJournalEntryFormToParams(form)

    expect(params).not.toHaveProperty('customerId')
    expect(params).not.toHaveProperty('vendorId')
    expect(params).not.toHaveProperty('referenceNumber')
    expect(params).not.toHaveProperty('tags')
  })

  it('includes customer, vendor, and tag identifiers when present', () => {
    const customer = makeCustomer()
    const vendor = makeVendor()
    const tag = makeTag({
      id: '00000000-0000-4000-8000-000000000701',
      key: 'department',
      value: 'sales',
      dimensionDisplayName: null,
      valueDisplayName: null,
      archivedAt: null,
      _local: { isOptimistic: false },
    })
    const form = buildForm({ customer, vendor, tags: [tag] })

    const params = convertJournalEntryFormToParams(form)

    expect(params.customerId).toBe(customer.id)
    expect(params.vendorId).toBe(vendor.id)
    expect(params.tags).toEqual([{ key: 'department', value: 'sales', dimensionDisplayName: null, valueDisplayName: null }])
  })
})

describe('validateJournalEntryForm', () => {
  it('returns null when the form is valid and balanced', () => {
    const form = buildForm()

    expect(validateJournalEntryForm({ value: form }, t)).toBeNull()
  })

  it('requires an entry date, created by, and memo', () => {
    const form = buildForm({ createdBy: '', memo: '   ' })

    const errors = validateJournalEntryForm({ value: form }, t)

    expect(errors).toEqual(expect.arrayContaining([
      { createdBy: 'Created by is a required field.' },
      { memo: 'Memo is a required field.' },
    ]))
  })

  it('requires at least one non-blank line item', () => {
    const form = buildForm({ lineItems: [BLANK_LINE_ITEM, BLANK_LINE_ITEM] })

    const errors = validateJournalEntryForm({ value: form }, t)

    expect(errors).toEqual([
      { lineItems: 'At least one line item is required.' },
    ])
  })

  it('requires at least one debit and one credit line item', () => {
    const form = buildForm({
      lineItems: [
        buildLineItem({ direction: LedgerEntryDirection.Debit }),
        buildLineItem({ direction: LedgerEntryDirection.Debit }),
      ],
    })

    const errors = validateJournalEntryForm({ value: form }, t)

    expect(errors).toEqual(expect.arrayContaining([
      { lineItems: 'At least one credit line item is required.' },
    ]))
  })

  it('requires debit and credit totals to match', () => {
    const form = buildForm({
      lineItems: [
        buildLineItem({ direction: LedgerEntryDirection.Debit, amount: convertCentsToNonRecursiveBigDecimal(1000) }),
        buildLineItem({ direction: LedgerEntryDirection.Credit, amount: convertCentsToNonRecursiveBigDecimal(500) }),
      ],
    })

    const errors = validateJournalEntryForm({ value: form }, t)

    expect(errors).toEqual(expect.arrayContaining([
      { lineItems: 'Debit and credit amounts must be equal' },
    ]))
  })

  it('flags a non-blank line item missing its account', () => {
    const form = buildForm({
      lineItems: [
        buildLineItem({ direction: LedgerEntryDirection.Debit, accountIdentifier: { type: 'AccountId', id: '' } }),
        buildLineItem({ direction: LedgerEntryDirection.Credit }),
      ],
    })

    const errors = validateJournalEntryForm({ value: form }, t)

    expect(errors).toEqual(expect.arrayContaining([
      { 'lineItems[0].accountIdentifier': 'Account is a required field.' },
    ]))
  })

  it('flags a negative line item amount', () => {
    const form = buildForm({
      lineItems: [
        buildLineItem({ direction: LedgerEntryDirection.Debit, amount: toNonRecursiveBigDecimal(BD.unsafeFromString('-5')) }),
        buildLineItem({ direction: LedgerEntryDirection.Credit }),
      ],
    })

    const errors = validateJournalEntryForm({ value: form }, t)

    expect(errors).toEqual(expect.arrayContaining([
      { 'lineItems[0].amount': 'Amount must be greater than zero.' },
    ]))
  })
})
