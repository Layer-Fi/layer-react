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
 * triggers call-compatible so the mode-selected response can be returned directly.
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

const useUpdateCategorizationRuleMutation = createMutationHook({
  tags: [UPSERT_CATEGORIZATION_RULE_TAG],
  request: updateCategorizationRule,
  keyParams: ['categorizationRuleId'],
  schema: UpsertCategorizationRuleReturnSchema,
  swrOptions: { throwOnError: true },
  useOnTriggerSuccess: () => {
    const { patchByKey: patchCategorizationRuleByKey } = useCategorizationRulesGlobalCacheActions()

    return (data) => {
      void patchCategorizationRuleByKey(data)
    }
  },
})

type UseUpsertCategorizationRuleProps =
  | { mode: UpsertCategorizationRuleMode.Create }
  | { mode: UpsertCategorizationRuleMode.Update, categorizationRuleId: string }

export function useUpsertCategorizationRule(props: UseUpsertCategorizationRuleProps) {
  const { mode } = props
  const categorizationRuleId = mode === UpsertCategorizationRuleMode.Update ? props.categorizationRuleId : undefined

  const createResponse = useCreateCategorizationRuleMutation()
  const updateResponse = useUpdateCategorizationRuleMutation({
    categorizationRuleId: categorizationRuleId ?? '',
  })

  return mode === UpsertCategorizationRuleMode.Create ? createResponse : updateResponse
}
