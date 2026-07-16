import { apiData } from '@msw/utils/apiResponse'
import { createMockEndpoint } from '@msw/utils/createMockEndpoint'
import { readRequestJson } from '@msw/utils/request'

// Mirrors the API's ApiOpeningBalance serialization; the client only reads
// `data.type` on success.
export const post = createMockEndpoint({
  method: 'post',
  path: '*/v1/businesses/:businessId/bank-accounts/:bankAccountId/opening-balance',
  resolve: async ({ request }) => {
    const body = await readRequestJson(request) as { effective_at?: string, balance?: number }
    const now = new Date().toISOString()

    return apiData({
      type: 'Opening_Balance',
      ledger_account_id: crypto.randomUUID(),
      ledger_account_name: 'Opening Balance Equity',
      balance: body.balance ?? 0,
      effective_at: body.effective_at ?? now,
      created_at: now,
      updated_at: now,
      transaction_tags: [],
      memo: null,
      metadata: null,
      reference_number: null,
    })
  },
})
