import { useCallback } from 'react'
import { Effect, Schema } from 'effect'
import useSWRMutation from 'swr/mutation'

import { SingleChartAccountSchema } from '@schemas/generalLedger/ledgerAccount'
import { type UpsertLedgerAccountSchema } from '@schemas/generalLedger/upsertLedgerAccount'
import { post, put } from '@utils/api/authenticatedHttp'
import { useLocalizedKey } from '@utils/swr/localeKeyMiddleware'
import { SWRMutationResult } from '@utils/swr/SWRResponseTypes'
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

function buildKey({
  access_token: accessToken,
  apiUrl,
  businessId,
  accountId = undefined,
}: {
  access_token?: string
  apiUrl?: string
  businessId: string
  accountId?: string
}) {
  if (accessToken && apiUrl) {
    return {
      accessToken,
      apiUrl,
      businessId,
      accountId,
      tags: [UPSERT_LEDGER_ACCOUNT_TAG_KEY],
    } as const
  }
}

const UpsertLedgerAccountReturnSchema = Schema.Struct({
  data: SingleChartAccountSchema,
})

type UpsertLedgerAccountReturn = typeof UpsertLedgerAccountReturnSchema.Type

const CreateParamsSchema = Schema.Struct({
  businessId: Schema.String,
})

const UpdateParamsSchema = Schema.Struct({
  businessId: Schema.String,
  accountId: Schema.String,
})

export type CreateParams = typeof CreateParamsSchema.Type
export type UpdateParams = typeof UpdateParamsSchema.Type

export type UpsertParams = CreateParams | UpdateParams

type RequestArgs = {
  apiUrl: string
  accessToken: string
  body: UpsertLedgerAccountBody
}

type UpsertRequestFn = (args: RequestArgs) => Promise<UpsertLedgerAccountReturn>

const isParamsValidForMode = <M extends UpsertLedgerAccountMode>(
  mode: M,
  params: unknown,
): params is M extends UpsertLedgerAccountMode.Update ? UpdateParams : CreateParams => {
  if (mode === UpsertLedgerAccountMode.Update) {
    return Effect.runSync(Effect.either(Schema.decodeUnknown(UpdateParamsSchema)(params)))._tag === 'Right'
  }

  if (mode === UpsertLedgerAccountMode.Create) {
    return Effect.runSync(Effect.either(Schema.decodeUnknown(CreateParamsSchema)(params)))._tag === 'Right'
  }

  return false
}

function getRequestFn(
  mode: UpsertLedgerAccountMode,
  params: UpsertParams,
): UpsertRequestFn {
  if (mode === UpsertLedgerAccountMode.Update) {
    if (!isParamsValidForMode(UpsertLedgerAccountMode.Update, params)) {
      throw new Error('Invalid params for update mode')
    }

    return ({ apiUrl, accessToken, body }: RequestArgs) =>
      updateLedgerAccount(apiUrl, accessToken, { params, body })
  }
  else {
    if (!isParamsValidForMode(UpsertLedgerAccountMode.Create, params)) {
      throw new Error('Invalid params for create mode')
    }

    return ({ apiUrl, accessToken, body }: RequestArgs) =>
      createLedgerAccount(apiUrl, accessToken, { params, body })
  }
}

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
      const request = getRequestFn(mode, { businessId, accountId })

      return request({
        apiUrl,
        accessToken,
        body,
      }).then(Schema.decodeUnknownPromise(UpsertLedgerAccountReturnSchema))
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

  return new Proxy(mutationResponse, {
    get(target, prop) {
      if (prop === 'trigger') {
        return stableProxiedTrigger
      }

      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return Reflect.get(target, prop)
    },
  })
}
