import { useCallback } from 'react'
import { Schema } from 'effect/index'
import useSWRMutation from 'swr/mutation'

import {
  CategorizationRuleSchema,
  type CreateCategorizationRuleSchema,
  type PatchCategorizationRuleSchema,
} from '@schemas/bankTransactions/categorizationRules/categorizationRule'
import { patch, post } from '@utils/api/authenticatedHttp'
import { useLocalizedKey } from '@utils/swr/localeKeyMiddleware'
import { useBankTransactionsGlobalCacheActions } from '@hooks/api/businesses/[business-id]/bank-transactions/useBankTransactions'
import { useCategorizationRulesGlobalCacheActions } from '@hooks/api/businesses/[business-id]/categorization-rules/useListCategorizationRules'
import { useProfitAndLossGlobalInvalidator } from '@hooks/features/profitAndLoss/useProfitAndLossGlobalInvalidator'
import { useAuth } from '@hooks/utils/auth/useAuth'
import { useLayerContext } from '@contexts/LayerContext/LayerContext'

const UPSERT_CATEGORIZATION_RULE_TAG = '#upsert-categorization-rule'

function buildKey({
  access_token: accessToken,
  apiUrl,
  businessId,
}: {
  access_token?: string
  apiUrl?: string
  businessId: string
}) {
  if (accessToken && apiUrl) {
    return {
      accessToken,
      apiUrl,
      businessId,
      tags: [UPSERT_CATEGORIZATION_RULE_TAG],
    }
  }
}

const UpsertCategorizationRuleReturnSchema = Schema.Struct({
  data: CategorizationRuleSchema,
})

type UpsertCategorizationRuleReturn = typeof UpsertCategorizationRuleReturnSchema.Type
type CreateCategorizationRuleBody = typeof CreateCategorizationRuleSchema.Encoded
type PatchCategorizationRuleBody = typeof PatchCategorizationRuleSchema.Encoded

export type UpsertCategorizationRuleArg =
  | { mode: 'create', body: CreateCategorizationRuleBody }
  | { mode: 'update', categorizationRuleId: string, body: PatchCategorizationRuleBody }

const createCategorizationRule = post<UpsertCategorizationRuleReturn, CreateCategorizationRuleBody>(
  ({ businessId }) =>
    `/v1/businesses/${businessId}/categorization-rules`,
)

const updateCategorizationRule = patch<UpsertCategorizationRuleReturn, PatchCategorizationRuleBody>(
  ({ businessId, categorizationRuleId }) =>
    `/v1/businesses/${businessId}/categorization-rules/${categorizationRuleId}`,
)

export function useUpsertCategorizationRule() {
  const withLocale = useLocalizedKey()
  const { data: auth } = useAuth()
  const { businessId } = useLayerContext()
  const { forceReloadBankTransactions } = useBankTransactionsGlobalCacheActions()
  const { debouncedInvalidateProfitAndLoss } = useProfitAndLossGlobalInvalidator()
  const { forceReloadCategorizationRules, patchCategorizationRuleByKey } = useCategorizationRulesGlobalCacheActions()

  const mutationResponse = useSWRMutation(
    () => withLocale(buildKey({
      access_token: auth?.access_token,
      apiUrl: auth?.apiUrl,
      businessId,
    })),
    (
      { accessToken, apiUrl, businessId },
      { arg }: { arg: UpsertCategorizationRuleArg },
    ) => {
      const decode = Schema.decodeUnknownPromise(UpsertCategorizationRuleReturnSchema)
      if (arg.mode === 'create') {
        return createCategorizationRule(
          apiUrl,
          accessToken,
          {
            params: { businessId },
            body: arg.body,
          },
        ).then(decode)
      }
      return updateCategorizationRule(
        apiUrl,
        accessToken,
        {
          params: { businessId, categorizationRuleId: arg.categorizationRuleId },
          body: arg.body,
        },
      ).then(decode)
    },
    {
      revalidate: false,
      throwOnError: true,
    },
  )

  const { trigger: originalTrigger } = mutationResponse

  const stableProxiedTrigger = useCallback(
    async (
      arg: UpsertCategorizationRuleArg,
      options?: Parameters<typeof originalTrigger>[1],
    ) => {
      const triggerResult = await originalTrigger(arg, options)

      if (arg.mode === 'create') {
        void forceReloadCategorizationRules()
        void forceReloadBankTransactions()
        void debouncedInvalidateProfitAndLoss()
      }
      else if (triggerResult) {
        void patchCategorizationRuleByKey(triggerResult.data)
      }

      return triggerResult
    },
    [originalTrigger, forceReloadCategorizationRules, forceReloadBankTransactions, debouncedInvalidateProfitAndLoss, patchCategorizationRuleByKey],
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
