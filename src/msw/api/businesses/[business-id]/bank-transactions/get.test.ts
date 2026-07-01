import { describe, expect, it } from 'vitest'

import { get as getBankTransactions } from '@msw/api/businesses/[business-id]/bank-transactions/get'
import { server } from '@msw/node'
import { makeBankTransactions } from '@fixtures/bankTransactions/mocks'
import { bankTransactions as defaultBankTransactions } from '@fixtures/generated/bankTransactions.gen'

const ENDPOINT = 'https://api.test/v1/businesses/test-business/bank-transactions'

const fetchPage = async (query = '') => {
  const response = await fetch(`${ENDPOINT}${query}`)
  return response.json() as Promise<{
    data: unknown[]
    meta: { pagination: { cursor: string | null, has_more: boolean, total_count: number } }
  }>
}

describe('GET bank-transactions mock handler', () => {
  it('serves the 100 generated fixtures with a wire-format envelope', async () => {
    const body = await fetchPage()

    expect(body.data).toHaveLength(defaultBankTransactions.length)
    expect(body.data).toHaveLength(100)
    expect(body.meta.pagination.total_count).toBe(100)
    // Wire format uses snake_case keys.
    expect(body.data[0]).toHaveProperty('business_id')
    expect(body.data[0]).toHaveProperty('categorization_status')
  })

  it('generates a variety of categorization states', () => {
    const statuses = new Set(defaultBankTransactions.map(transaction => transaction.categorizationStatus))
    expect(statuses).toContain('READY_FOR_INPUT')
    expect(statuses).toContain('CATEGORIZED')
    expect(statuses).toContain('SPLIT')
    expect(statuses).toContain('MATCHED')

    // Splits carry entries that sum to the transaction amount.
    const splits = defaultBankTransactions.filter(
      transaction => transaction.category?.type === 'Split_Categorization',
    )
    expect(splits.length).toBeGreaterThan(0)
    splits.forEach((transaction) => {
      const entries = transaction.category?.type === 'Split_Categorization' ? transaction.category.entries : []
      const total = entries.reduce((sum, entry) => sum + entry.amount, 0)
      expect(total).toBeCloseTo(transaction.amount, 2)
    })

    // Transfers appear both as applied matches and as suggested matches.
    expect(defaultBankTransactions.some(
      transaction => transaction.match?.details.type === 'Transfer_Match',
    )).toBe(true)
    expect(defaultBankTransactions.some(
      transaction => transaction.suggestedMatches.some(match => match.details.type === 'Transfer_Match'),
    )).toBe(true)

    // Uncategorized transactions surface vendor-appropriate suggestions.
    const withSuggestions = defaultBankTransactions.filter(
      transaction => (transaction.categorizationFlow?.suggestions.length ?? 0) > 0,
    )
    expect(withSuggestions.length).toBeGreaterThan(0)
    withSuggestions.forEach((transaction) => {
      expect(transaction.categorizationStatus).toBe('READY_FOR_INPUT')
    })
  })

  it('filters by categorized and direction params', async () => {
    const categorized = await fetchPage('?categorized=true')
    const uncategorized = await fetchPage('?categorized=false')
    expect(categorized.data.length).toBeGreaterThan(0)
    expect(uncategorized.data.length).toBeGreaterThan(0)
    expect(categorized.meta.pagination.total_count + uncategorized.meta.pagination.total_count).toBe(100)

    const inflows = await fetchPage('?direction=INFLOW')
    const outflows = await fetchPage('?direction=OUTFLOW')
    expect(inflows.data.length).toBeGreaterThan(0)
    expect(outflows.data.length).toBeGreaterThan(0)
    expect(inflows.meta.pagination.total_count + outflows.meta.pagination.total_count).toBe(100)
  })

  it('paginates via cursor + limit', async () => {
    const firstPage = await fetchPage('?limit=40')
    expect(firstPage.data).toHaveLength(40)
    expect(firstPage.meta.pagination.has_more).toBe(true)
    expect(firstPage.meta.pagination.cursor).toBe('40')

    const lastPage = await fetchPage('?limit=40&cursor=80')
    expect(lastPage.data).toHaveLength(20)
    expect(lastPage.meta.pagination.has_more).toBe(false)
    expect(lastPage.meta.pagination.cursor).toBeNull()
  })

  it('returns a test-supplied override set', async () => {
    const overrides = makeBankTransactions(3, index => ({ id: `txn-${index}` }))
    server.use(getBankTransactions.mock(overrides))

    const body = await fetchPage()
    expect(body.data).toHaveLength(3)
    expect(body.meta.pagination.total_count).toBe(3)
  })
})
