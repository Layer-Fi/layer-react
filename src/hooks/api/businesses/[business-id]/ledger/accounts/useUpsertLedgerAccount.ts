import { useCallback } from 'react'
import { Schema } from 'effect'
import useSWRMutation from 'swr/mutation'

import { SingleChartAccountSchema } from '@schemas/generalLedger/ledgerAccount'
import { type UpsertLedgerAccountSchema } from '@schemas/generalLedger/upsertLedgerAccount'
import { post, put } from '@utils/api/authenticatedHttp'
import { createBuildKey } from '@utils/swr/createBuildKey'
import { useLocalizedKey } from '@utils/swr/localeKeyMiddleware'
import { SWRMutationResult } from '@utils/swr/SWRResponseTypes'
import { withStableTrigger } from '@utils/swr/withStableTrigger'
import { useLedgerBalancesCacheActions } from '@hooks/api/businesses/[business-id]/ledger/balances/useLedgerBalances'
import { useLedgerEntriesCacheActions } from '@hooks/api/businesses/[business-id]/ledger/entries/useListLedgerEntries'
import { useAuth } from '@hooks/utils/auth/useAuth'
import { useLayerContext } from '@contexts/LayerContext/LayerContext'

const UPSERT_LEDGER_ACCOUNT_TAG_KEY = '#upsert-ledger-account'

export enum UpsertLedgerAccountMode {
  Create = 'Create',
  Update = 'Update',
}

type UpsertLedgerAccountBody = typeof UpsertLedgerAccountSchema.Encoded

const createLedgerAccount = post<
  UpsertLedgerAccountReturn,
  UpsertLedgerAccountBody,
  { businessId: string }
>(({ businessId }) => `/v1/businesses/${businessId}/ledger/accounts`)

const updateLedgerAccount = put<
  UpsertLedgerAccountReturn,
  UpsertLedgerAccountBody,
  { businessId: string, accountId: string }
>(({ businessId, accountId }) => `/v1/businesses/${businessId}/ledger/accounts/${accountId}`)

const buildKey = createBuildKey<{ businessId: string, accountId?: string }>([UPSERT_LEDGER_ACCOUNT_TAG_KEY])

const UpsertLedgerAccountReturnSchema = Schema.Struct({
  data: SingleChartAccountSchema,
})

type UpsertLedgerAccountReturn = typeof UpsertLedgerAccountReturnSchema.Type

type UseUpsertLedgerAccountProps =
  | { mode: UpsertLedgerAccountMode.Create }
  | { mode: UpsertLedgerAccountMode.Update, accountId: string }

export const useUpsertLedgerAccount = (props: UseUpsertLedgerAccountProps) => {
  const withLocale = useLocalizedKey()
  const { data } = useAuth()
  const { businessId } = useLayerContext()

  const { mode } = props
  const accountId = mode === UpsertLedgerAccountMode.Update ? props.accountId : undefined

  const rawMutationResponse = useSWRMutation(
    () => withLocale(buildKey({
      ...data,
      businessId,
      accountId,
    })),
    (
      { accessToken, apiUrl, businessId, accountId },
      { arg: body }: { arg: UpsertLedgerAccountBody },
    ) => {
      if (mode === UpsertLedgerAccountMode.Update) {
        if (!accountId) {
          throw new Error('Cannot update a ledger account without an account id')
        }

        return updateLedgerAccount(apiUrl, accessToken, { params: { businessId, accountId }, body })
          .then(Schema.decodeUnknownPromise(UpsertLedgerAccountReturnSchema))
      }

      return createLedgerAccount(apiUrl, accessToken, { params: { businessId }, body })
        .then(Schema.decodeUnknownPromise(UpsertLedgerAccountReturnSchema))
    },
    {
      revalidate: false,
      throwOnError: true,
    },
  )

  const mutationResponse = new SWRMutationResult(rawMutationResponse)

  const { invalidateLedgerBalances } = useLedgerBalancesCacheActions()
  const { forceReloadLedgerEntries } = useLedgerEntriesCacheActions()

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
