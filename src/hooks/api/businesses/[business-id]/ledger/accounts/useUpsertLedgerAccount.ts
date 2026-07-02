import { useCallback } from 'react'
import { Schema } from 'effect'

import { SingleChartAccountSchema } from '@schemas/generalLedger/ledgerAccount'
import { type UpsertLedgerAccountSchema } from '@schemas/generalLedger/upsertLedgerAccount'
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

const UpsertLedgerAccountReturnSchema = Schema.Struct({
  data: SingleChartAccountSchema,
})

type UpsertLedgerAccountReturnEncoded = typeof UpsertLedgerAccountReturnSchema.Encoded

const createLedgerAccount = post<UpsertLedgerAccountReturnEncoded, UpsertLedgerAccountBody>(
  ({ businessId }) => `/v1/businesses/${businessId}/ledger/accounts`,
)

const updateLedgerAccount = put<
  UpsertLedgerAccountReturnEncoded,
  UpsertLedgerAccountBody,
  { businessId: string, accountId: string }
>(({ businessId, accountId }) => `/v1/businesses/${businessId}/ledger/accounts/${accountId}`)

type UpsertLedgerAccountParams = { businessId: string, accountId?: string }

const upsertLedgerAccount = (
  baseUrl: string,
  accessToken: string | undefined,
  options?: { params?: UpsertLedgerAccountParams, body?: UpsertLedgerAccountBody },
): Promise<UpsertLedgerAccountReturnEncoded> => {
  const { params, body } = options ?? {}

  if (params?.accountId !== undefined) {
    return updateLedgerAccount(baseUrl, accessToken, {
      params: { businessId: params.businessId, accountId: params.accountId },
      body,
    })
  }

  return createLedgerAccount(baseUrl, accessToken, {
    params: { businessId: params?.businessId },
    body,
  })
}

const useUpsertLedgerAccountMutation = createMutationHook({
  tags: [UPSERT_LEDGER_ACCOUNT_TAG_KEY],
  request: upsertLedgerAccount,
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

  const mutationResponse = useUpsertLedgerAccountMutation({ accountId })

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
