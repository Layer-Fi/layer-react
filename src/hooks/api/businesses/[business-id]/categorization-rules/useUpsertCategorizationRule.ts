import { useCallback } from 'react'

import {
  CategorizationRuleSchema,
  type CreateCategorizationRuleSchema,
  type PatchCategorizationRuleSchema,
} from '@schemas/bankTransactions/categorizationRules/categorizationRule'
import { UnwrappedDataResponseSchema } from '@schemas/utils'
import { patch, post } from '@utils/api/authenticatedHttp'
import { withStableTrigger } from '@utils/swr/withStableTrigger'
import { useBankTransactionsGlobalCacheActions } from '@hooks/api/businesses/[business-id]/bank-transactions/useBankTransactions'
import { useCategorizationRulesGlobalCacheActions } from '@hooks/api/businesses/[business-id]/categorization-rules/useListCategorizationRules'
import { useProfitAndLossGlobalInvalidator } from '@hooks/features/profitAndLoss/useProfitAndLossGlobalInvalidator'
import { createMutationHook } from '@hooks/utils/swr/createMutationHook'

const UPSERT_CATEGORIZATION_RULE_TAG = '#upsert-categorization-rule'

export enum UpsertCategorizationRuleMode {
  Create = 'Create',
  Update = 'Update',
}

const UpsertCategorizationRuleReturnSchema = UnwrappedDataResponseSchema(CategorizationRuleSchema)

type UpsertCategorizationRuleReturnEncoded = typeof UpsertCategorizationRuleReturnSchema.Encoded
type CreateCategorizationRuleBody = typeof CreateCategorizationRuleSchema.Encoded
type PatchCategorizationRuleBody = typeof PatchCategorizationRuleSchema.Encoded

/*
 * Create and patch accept different fields; the shared body type keeps both mutations'
 * triggers call-compatible so the mode-selected response can back `withStableTrigger`.
 * Callers pass the body matching the mode the hook was created with.
 */
type UpsertCategorizationRuleBody = CreateCategorizationRuleBody | PatchCategorizationRuleBody

const createCategorizationRule = post<UpsertCategorizationRuleReturnEncoded, UpsertCategorizationRuleBody>(
  ({ businessId }) =>
    `/v1/businesses/${businessId}/categorization-rules`,
)

const updateCategorizationRule = patch<
  UpsertCategorizationRuleReturnEncoded,
  UpsertCategorizationRuleBody,
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

const useUpdateCategorizationRuleMutation = createMutationHook({
  tags: [UPSERT_CATEGORIZATION_RULE_TAG],
  request: updateCategorizationRule,
  keyParamNames: ['categorizationRuleId'],
  schema: UpsertCategorizationRuleReturnSchema,
  swrOptions: { throwOnError: true },
})

type UseUpsertCategorizationRuleProps =
  | { mode: UpsertCategorizationRuleMode.Create }
  | { mode: UpsertCategorizationRuleMode.Update, categorizationRuleId: string }

export function useUpsertCategorizationRule(props: UseUpsertCategorizationRuleProps) {
  const { mode } = props
  const categorizationRuleId = mode === UpsertCategorizationRuleMode.Update ? props.categorizationRuleId : undefined

  const { forceReloadBankTransactions } = useBankTransactionsGlobalCacheActions()
  const { debouncedInvalidateProfitAndLoss } = useProfitAndLossGlobalInvalidator()
  const { forceReload: forceReloadCategorizationRules, patchByKey: patchCategorizationRuleByKey } = useCategorizationRulesGlobalCacheActions()

  const createResponse = useCreateCategorizationRuleMutation()
  const updateResponse = useUpdateCategorizationRuleMutation({
    categorizationRuleId: categorizationRuleId ?? '',
  })

  const mutationResponse = mode === UpsertCategorizationRuleMode.Create ? createResponse : updateResponse

  const { trigger: createTrigger } = createResponse
  const { trigger: updateTrigger } = updateResponse

  const stableProxiedTrigger = useCallback(
    async (body: UpsertCategorizationRuleBody) => {
      if (mode === UpsertCategorizationRuleMode.Create) {
        const triggerResult = await createTrigger(body)

        void forceReloadCategorizationRules()
        void forceReloadBankTransactions()
        void debouncedInvalidateProfitAndLoss()

        return triggerResult
      }

      const triggerResult = await updateTrigger(body)

      if (triggerResult) {
        void patchCategorizationRuleByKey(triggerResult)
      }

      return triggerResult
    },
    [
      mode,
      createTrigger,
      updateTrigger,
      forceReloadCategorizationRules,
      forceReloadBankTransactions,
      debouncedInvalidateProfitAndLoss,
      patchCategorizationRuleByKey,
    ],
  )

  return withStableTrigger(mutationResponse, stableProxiedTrigger)
}
