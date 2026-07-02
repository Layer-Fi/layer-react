import { Schema } from 'effect/index'

import { LedgerBalancesSchema, type LedgerBalancesSchemaType } from '@schemas/generalLedger/ledgerAccount'
import { getWithQuery } from '@utils/api/getWithQuery'
import { createResourceGlobalCacheActions } from '@utils/swr/createGlobalCacheActions'
import { createQueryHook } from '@hooks/utils/swr/createQueryHook'

export const LEDGER_BALANCES_TAG_KEY = '#ledger-balances'

type GetLedgerAccountBalancesParams = {
  businessId: string
  startDate?: Date
  endDate?: Date
}

const LedgerBalancesResponseSchema = Schema.Struct({ data: LedgerBalancesSchema })

const getLedgerAccountBalances = getWithQuery<
  typeof LedgerBalancesResponseSchema.Encoded,
  GetLedgerAccountBalancesParams
>(
  ['businessId'],
  ({ businessId }) => `/v1/businesses/${businessId}/ledger/balances`,
)

export const useLedgerBalances = createQueryHook({
  tags: [LEDGER_BALANCES_TAG_KEY],
  request: getLedgerAccountBalances,
  schema: LedgerBalancesResponseSchema,
  select: ({ data }) => data,
})

export const useLedgerBalancesCacheActions = createResourceGlobalCacheActions<LedgerBalancesSchemaType>(LEDGER_BALANCES_TAG_KEY)
