import {
  CategorizationRuleSchema,
  type CreateCategorizationRuleSchema,
  type PatchCategorizationRuleSchema,
} from '@schemas/bankTransactions/categorizationRules/categorizationRule'
import { UnwrappedDataResponseSchema } from '@schemas/utils'
import { post } from '@utils/api/authenticatedHttp'
import { useBankTransactionsGlobalCacheActions } from '@api/businesses/[business-id]/bank-transactions/get'
import { useCategorizationRulesGlobalCacheActions } from '@api/businesses/[business-id]/categorization-rules/get'
import { useProfitAndLossGlobalInvalidator } from '@api/businesses/[business-id]/reports/profit-and-loss/useProfitAndLossGlobalInvalidator'
import { createMutationHook } from '@hooks/utils/swr/createMutationHook'

export const UPSERT_CATEGORIZATION_RULE_TAG = '#upsert-categorization-rule'

export const UpsertCategorizationRuleReturnSchema = UnwrappedDataResponseSchema(CategorizationRuleSchema)

export type UpsertCategorizationRuleReturnEncoded = typeof UpsertCategorizationRuleReturnSchema.Encoded

/*
 * Create and patch accept different fields; the shared body type keeps both mutations'
 * triggers call-compatible so the mode-selected response can be returned directly.
 * Callers pass the body matching the mode the hook was created with.
 */
export type UpsertCategorizationRuleBody =
  | typeof CreateCategorizationRuleSchema.Encoded
  | typeof PatchCategorizationRuleSchema.Encoded

const createCategorizationRule = post<UpsertCategorizationRuleReturnEncoded, UpsertCategorizationRuleBody>(
  ({ businessId }) =>
    `/v1/businesses/${businessId}/categorization-rules`,
)

export const usePostCategorizationRule = createMutationHook({
  tags: [UPSERT_CATEGORIZATION_RULE_TAG],
  request: createCategorizationRule,
  schema: UpsertCategorizationRuleReturnSchema,
  swrOptions: { throwOnError: true },
  useOnTriggerSuccess: () => {
    const { forceReload: forceReloadCategorizationRules } = useCategorizationRulesGlobalCacheActions()
    const { forceReloadBankTransactions } = useBankTransactionsGlobalCacheActions()
    const { debouncedInvalidateProfitAndLoss } = useProfitAndLossGlobalInvalidator()

    return () => {
      void forceReloadCategorizationRules()
      void forceReloadBankTransactions()
      void debouncedInvalidateProfitAndLoss()
    }
  },
})
