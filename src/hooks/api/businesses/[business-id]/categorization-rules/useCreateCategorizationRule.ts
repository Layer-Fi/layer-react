import { useCallback } from 'react'

import { CategorizationRuleSchema, type CreateCategorizationRuleSchema } from '@schemas/bankTransactions/categorizationRules/categorizationRule'
import { UnwrappedDataResponseSchema } from '@schemas/utils'
import { post } from '@utils/api/authenticatedHttp'
import { withStableTrigger } from '@utils/swr/withStableTrigger'
import { useBankTransactionsGlobalCacheActions } from '@hooks/api/businesses/[business-id]/bank-transactions/useBankTransactions'
import { useCategorizationRulesGlobalCacheActions } from '@hooks/api/businesses/[business-id]/categorization-rules/useListCategorizationRules'
import { useProfitAndLossGlobalInvalidator } from '@hooks/features/profitAndLoss/useProfitAndLossGlobalInvalidator'
import { createMutationHook } from '@hooks/utils/swr/createMutationHook'

const CREATE_CATEGORIZATION_RULE_TAG = '#create-categorization-rule'

const CreateCategorizationRuleReturnSchema = UnwrappedDataResponseSchema(CategorizationRuleSchema)

type CreateCategorizationRuleBody = typeof CreateCategorizationRuleSchema.Encoded

const createCategorizationRule = post<
  typeof CreateCategorizationRuleReturnSchema.Encoded,
  CreateCategorizationRuleBody,
  { businessId: string }
>(
  ({ businessId }) =>
    `/v1/businesses/${businessId}/categorization-rules`,
)

const useCreateCategorizationRuleMutation = createMutationHook({
  tags: [CREATE_CATEGORIZATION_RULE_TAG],
  request: createCategorizationRule,
  schema: CreateCategorizationRuleReturnSchema,
})

export function useCreateCategorizationRule() {
  const { forceReloadBankTransactions } = useBankTransactionsGlobalCacheActions()

  const { debouncedInvalidateProfitAndLoss } = useProfitAndLossGlobalInvalidator()
  const { forceReload: forceReloadCategorizationRules } = useCategorizationRulesGlobalCacheActions()

  const mutationResponse = useCreateCategorizationRuleMutation()
  const { trigger: originalTrigger } = mutationResponse

  const stableProxiedTrigger = useCallback(
    async (...triggerParameters: Parameters<typeof originalTrigger>) => {
      const triggerResult = await originalTrigger(...triggerParameters)
      void forceReloadBankTransactions()

      void forceReloadCategorizationRules()

      void debouncedInvalidateProfitAndLoss()

      return triggerResult
    },
    [originalTrigger, forceReloadBankTransactions, forceReloadCategorizationRules, debouncedInvalidateProfitAndLoss],
  )

  return withStableTrigger(mutationResponse, stableProxiedTrigger)
}
