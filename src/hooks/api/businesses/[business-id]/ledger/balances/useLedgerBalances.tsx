import { LedgerBalancesSchema, type LedgerBalancesSchemaType } from '@schemas/generalLedger/ledgerAccount'
import { UnwrappedDataResponseSchema } from '@schemas/utils'
import { getWithQuery } from '@utils/api/getWithQuery'
import { createResourceGlobalCacheActions } from '@utils/swr/createGlobalCacheActions'
import { createQueryHook } from '@hooks/utils/swr/createQueryHook'

export const LEDGER_BALANCES_TAG_KEY = '#ledger-balances'

type GetLedgerAccountBalancesParams = {
  businessId: string
  startDate?: Date
  endDate?: Date
}

const LedgerBalancesResponseSchema = UnwrappedDataResponseSchema(LedgerBalancesSchema)

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
})

export const useLedgerBalancesCacheActions = createResourceGlobalCacheActions<LedgerBalancesSchemaType>(LEDGER_BALANCES_TAG_KEY)
