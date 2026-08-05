import { UnwrappedDataResponseSchema } from '@schemas/common/utils'
import { LedgerBalancesSchema, type LedgerBalancesSchemaType } from '@schemas/features/generalLedger/ledgerBalances'
import { getWithQuery } from '@utils/shared/api/getWithQuery'
import { createQueryHook } from '@hooks/utils/swr/createQueryHook'
import { createResourceGlobalCacheActions } from '@hooks/utils/swr/createResourceGlobalCacheActions'

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

export const useGetLedgerBalances = createQueryHook({
  tags: [LEDGER_BALANCES_TAG_KEY],
  request: getLedgerAccountBalances,
  schema: LedgerBalancesResponseSchema,
})

export const useLedgerBalancesCacheActions = createResourceGlobalCacheActions<LedgerBalancesSchemaType>(LEDGER_BALANCES_TAG_KEY)
