import { useCallback } from 'react'

import {
  CategorizationRuleSchema,
  type CreateCategorizationRuleSchema,
  type PatchCategorizationRuleSchema,
} from '@schemas/bankTransactions/categorizationRules/categorizationRule'
import { UnwrappedDataResponseSchema } from '@schemas/utils'
import { patch, post } from '@utils/api/authenticatedHttp'
import { useBankTransactionsGlobalCacheActions } from '@hooks/api/businesses/[business-id]/bank-transactions/useBankTransactions'
import { useCategorizationRulesGlobalCacheActions } from '@hooks/api/businesses/[business-id]/categorization-rules/useListCategorizationRules'
import { useProfitAndLossGlobalInvalidator } from '@hooks/features/profitAndLoss/useProfitAndLossGlobalInvalidator'
import { createMutationHook } from '@hooks/utils/swr/createMutationHook'

const UPSERT_CATEGORIZATION_RULE_TAG = '#upsert-categorization-rule'

const UpsertCategorizationRuleReturnSchema = UnwrappedDataResponseSchema(CategorizationRuleSchema)

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

const updateCategorizationRule = patch<
  UpsertCategorizationRuleReturnEncoded,
  PatchCategorizationRuleBody,
  { businessId: string, categorizationRuleId: string }
>(
  ({ businessId, categorizationRuleId }) =>
    `/v1/businesses/${businessId}/categorization-rules/${categorizationRuleId}`,
)

const useCreateCategorizationRuleMutation = createMutationHook({
  tags: [UPSERT_CATEGORIZATION_RULE_TAG],
  request: createCategorizationRule,
  schema: UpsertCategorizationRuleReturnSchema,
  swrOptions: { throwOnError: true },
})

type UpdateCategorizationRuleArg = { categorizationRuleId: string, body: PatchCategorizationRuleBody }

const useUpdateCategorizationRuleMutation = createMutationHook({
  tags: [UPSERT_CATEGORIZATION_RULE_TAG],
  request: updateCategorizationRule,
  argToParams: ({ categorizationRuleId }: UpdateCategorizationRuleArg) => ({ categorizationRuleId }),
  argToBody: ({ body }: UpdateCategorizationRuleArg) => body,
  schema: UpsertCategorizationRuleReturnSchema,
  swrOptions: { throwOnError: true },
})

export function useUpsertCategorizationRule() {
  const { forceReloadBankTransactions } = useBankTransactionsGlobalCacheActions()
  const { debouncedInvalidateProfitAndLoss } = useProfitAndLossGlobalInvalidator()
  const { forceReload: forceReloadCategorizationRules, patchByKey: patchCategorizationRuleByKey } = useCategorizationRulesGlobalCacheActions()

  const createResponse = useCreateCategorizationRuleMutation()
  const updateResponse = useUpdateCategorizationRuleMutation()

  const { trigger: createTrigger } = createResponse
  const { trigger: updateTrigger } = updateResponse

  const stableProxiedTrigger = useCallback(
    async (arg: UpsertCategorizationRuleArg) => {
      if (arg.mode === 'create') {
        const triggerResult = await createTrigger(arg.body)

        void forceReloadCategorizationRules()
        void forceReloadBankTransactions()
        void debouncedInvalidateProfitAndLoss()

        return triggerResult
      }

      const triggerResult = await updateTrigger({
        categorizationRuleId: arg.categorizationRuleId,
        body: arg.body,
      })

      if (triggerResult) {
        void patchCategorizationRuleByKey(triggerResult)
      }

      return triggerResult
    },
    [createTrigger, updateTrigger, forceReloadCategorizationRules, forceReloadBankTransactions, debouncedInvalidateProfitAndLoss, patchCategorizationRuleByKey],
  )

  const mutationResponse = updateResponse.isMutating ? updateResponse : createResponse

  return {
    trigger: stableProxiedTrigger,
    data: mutationResponse.data,
    isMutating: mutationResponse.isMutating,
    error: mutationResponse.error,
    isError: mutationResponse.isError,
  }
}
