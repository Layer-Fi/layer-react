import { put } from '@utils/shared/api/authenticatedHttp'
import {
  UPSERT_LEDGER_ACCOUNT_TAG_KEY,
  type UpsertLedgerAccountBody,
  type UpsertLedgerAccountReturnEncoded,
  UpsertLedgerAccountReturnSchema,
  useLedgerAccountTriggerSuccess,
} from '@api/businesses/[business-id]/ledger/accounts/post'
import { createMutationHook } from '@hooks/utils/swr/createMutationHook'

const updateLedgerAccount = put<
  UpsertLedgerAccountReturnEncoded,
  UpsertLedgerAccountBody,
  { businessId: string, accountId: string }
>(({ businessId, accountId }) => `/v1/businesses/${businessId}/ledger/accounts/${accountId}`)

export const usePutLedgerAccount = createMutationHook({
  tags: [UPSERT_LEDGER_ACCOUNT_TAG_KEY],
  request: updateLedgerAccount,
  keyParams: ['accountId'],
  schema: UpsertLedgerAccountReturnSchema,
  swrOptions: { throwOnError: true },
  useOnTriggerSuccess: useLedgerAccountTriggerSuccess,
})
