import { useCallback } from 'react'

import { SingleChartAccountSchema } from '@schemas/generalLedger/ledgerAccount'
import { type UpsertLedgerAccountSchema } from '@schemas/generalLedger/upsertLedgerAccount'
import { UnwrappedDataResponseSchema } from '@schemas/utils'
import { post, put } from '@utils/api/authenticatedHttp'
import { withStableTrigger } from '@utils/swr/withStableTrigger'
import { useLedgerBalancesCacheActions } from '@hooks/api/businesses/[business-id]/ledger/balances/useLedgerBalances'
import { useLedgerEntriesCacheActions } from '@hooks/api/businesses/[business-id]/ledger/entries/useListLedgerEntries'
import { createMutationHook } from '@hooks/utils/swr/createMutationHook'

const UPSERT_LEDGER_ACCOUNT_TAG_KEY = '#upsert-ledger-account'

export enum UpsertLedgerAccountMode {
  Create = 'Create',
  Update = 'Update',
}

type UpsertLedgerAccountBody = typeof UpsertLedgerAccountSchema.Encoded

const UpsertLedgerAccountReturnSchema = UnwrappedDataResponseSchema(SingleChartAccountSchema)

type UpsertLedgerAccountReturnEncoded = typeof UpsertLedgerAccountReturnSchema.Encoded

const createLedgerAccount = post<UpsertLedgerAccountReturnEncoded, UpsertLedgerAccountBody>(
  ({ businessId }) => `/v1/businesses/${businessId}/ledger/accounts`,
)

const updateLedgerAccount = put<
  UpsertLedgerAccountReturnEncoded,
  UpsertLedgerAccountBody,
  { businessId: string, accountId: string }
>(({ businessId, accountId }) => `/v1/businesses/${businessId}/ledger/accounts/${accountId}`)

const useCreateLedgerAccount = createMutationHook({
  tags: [UPSERT_LEDGER_ACCOUNT_TAG_KEY],
  request: createLedgerAccount,
  schema: UpsertLedgerAccountReturnSchema,
  swrOptions: { throwOnError: true },
})

const useUpdateLedgerAccount = createMutationHook({
  tags: [UPSERT_LEDGER_ACCOUNT_TAG_KEY],
  request: updateLedgerAccount,
  keyParams: ['accountId'],
  schema: UpsertLedgerAccountReturnSchema,
  swrOptions: { throwOnError: true },
})

type UseUpsertLedgerAccountProps =
  | { mode: UpsertLedgerAccountMode.Create }
  | { mode: UpsertLedgerAccountMode.Update, accountId: string }

export const useUpsertLedgerAccount = (props: UseUpsertLedgerAccountProps) => {
  const { mode } = props
  const accountId = mode === UpsertLedgerAccountMode.Update ? props.accountId : undefined

  const createResponse = useCreateLedgerAccount()
  const updateResponse = useUpdateLedgerAccount({
    accountId: accountId ?? '',
    isEnabled: accountId !== undefined,
  })

  const mutationResponse = mode === UpsertLedgerAccountMode.Create ? createResponse : updateResponse

  const { invalidate: invalidateLedgerBalances } = useLedgerBalancesCacheActions()
  const { forceReload: forceReloadLedgerEntries } = useLedgerEntriesCacheActions()

  const originalTrigger = mutationResponse.trigger

  const stableProxiedTrigger = useCallback(
    async (...triggerParameters: Parameters<typeof originalTrigger>) => {
      const triggerResult = await originalTrigger(...triggerParameters)

      void invalidateLedgerBalances()
      void forceReloadLedgerEntries()

      return triggerResult
    },
    [originalTrigger, invalidateLedgerBalances, forceReloadLedgerEntries],
  )

  return withStableTrigger(mutationResponse, stableProxiedTrigger)
}
