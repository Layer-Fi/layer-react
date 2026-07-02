import { useCallback } from 'react'
import { Schema } from 'effect/index'

import {
  CategorizationRuleSchema,
  type CreateCategorizationRuleSchema,
  type PatchCategorizationRuleSchema,
} from '@schemas/bankTransactions/categorizationRules/categorizationRule'
import { patch, post } from '@utils/api/authenticatedHttp'
import { withStableTrigger } from '@utils/swr/withStableTrigger'
import { useBankTransactionsGlobalCacheActions } from '@hooks/api/businesses/[business-id]/bank-transactions/useBankTransactions'
import { useCategorizationRulesGlobalCacheActions } from '@hooks/api/businesses/[business-id]/categorization-rules/useListCategorizationRules'
import { useProfitAndLossGlobalInvalidator } from '@hooks/features/profitAndLoss/useProfitAndLossGlobalInvalidator'
import { createMutationHook } from '@hooks/utils/swr/createMutationHook'

const UPSERT_CATEGORIZATION_RULE_TAG = '#upsert-categorization-rule'

const UpsertCategorizationRuleReturnSchema = Schema.Struct({
  data: CategorizationRuleSchema,
})

type UpsertCategorizationRuleReturnEncoded = typeof UpsertCategorizationRuleReturnSchema.Encoded
type CreateCategorizationRuleBody = typeof CreateCategorizationRuleSchema.Encoded
type PatchCategorizationRuleBody = typeof PatchCategorizationRuleSchema.Encoded

export type UpsertCategorizationRuleArg =
  | { mode: 'create', body: CreateCategorizationRuleBody }
  | { mode: 'update', categorizationRuleId: string, body: PatchCategorizationRuleBody }

const createCategorizationRule = post<UpsertCategorizationRuleReturnEncoded, CreateCategorizationRuleBody>(
  ({ businessId }) =>
    `/v1/businesses/${businessId}/categorization-rules`,
)

const updateCategorizationRule = patch<UpsertCategorizationRuleReturnEncoded, PatchCategorizationRuleBody>(
  ({ businessId, categorizationRuleId }) =>
    `/v1/businesses/${businessId}/categorization-rules/${categorizationRuleId}`,
)

type UpsertCategorizationRuleParams = { businessId: string, categorizationRuleId?: string }
type UpsertCategorizationRuleBody = CreateCategorizationRuleBody | PatchCategorizationRuleBody

const upsertCategorizationRule = (
  baseUrl: string,
  accessToken: string | undefined,
  options?: { params?: UpsertCategorizationRuleParams, body?: UpsertCategorizationRuleBody },
): Promise<UpsertCategorizationRuleReturnEncoded> => {
  const { params, body } = options ?? {}

  if (params?.categorizationRuleId !== undefined) {
    return updateCategorizationRule(baseUrl, accessToken, {
      params: { businessId: params.businessId, categorizationRuleId: params.categorizationRuleId },
      body: body as PatchCategorizationRuleBody,
    })
  }

  return createCategorizationRule(baseUrl, accessToken, {
    params: { businessId: params?.businessId },
    body: body as CreateCategorizationRuleBody,
  })
}

const useUpsertCategorizationRuleMutation = createMutationHook({
  tags: [UPSERT_CATEGORIZATION_RULE_TAG],
  request: upsertCategorizationRule,
  argToParams: (arg: UpsertCategorizationRuleArg) =>
    arg.mode === 'update' ? { categorizationRuleId: arg.categorizationRuleId } : {},
  argToBody: (arg: UpsertCategorizationRuleArg) => arg.body,
  schema: UpsertCategorizationRuleReturnSchema,
  swrOptions: { throwOnError: true },
})

export function useUpsertCategorizationRule() {
  const { forceReloadBankTransactions } = useBankTransactionsGlobalCacheActions()
  const { debouncedInvalidateProfitAndLoss } = useProfitAndLossGlobalInvalidator()
  const { forceReload: forceReloadCategorizationRules, patchByKey: patchCategorizationRuleByKey } = useCategorizationRulesGlobalCacheActions()

  const mutationResponse = useUpsertCategorizationRuleMutation()
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

  return withStableTrigger(mutationResponse, stableProxiedTrigger)
}
