import { type TaxProfileRequest, TaxProfileResponseSchema } from '@schemas/taxEstimates/profile'
import { patch, post } from '@utils/api/authenticatedHttp'
import { useTaxDetailsGlobalCacheActions } from '@hooks/api/businesses/[business-id]/tax-estimates/details/useTaxDetails'
import { useTaxPaymentsGlobalCacheActions } from '@hooks/api/businesses/[business-id]/tax-estimates/payments/useTaxPayments'
import { useTaxProfileGlobalCacheActions } from '@hooks/api/businesses/[business-id]/tax-estimates/profile/useTaxProfile'
import { createMutationHook } from '@hooks/utils/swr/createMutationHook'

const UPSERT_TAX_PROFILE_TAG_KEY = '#upsert-tax-profile'

export enum UpsertTaxProfileMode {
  Create = 'Create',
  Update = 'Update',
}

export const createTaxProfile = post<
  typeof TaxProfileResponseSchema.Encoded,
  TaxProfileRequest,
  { businessId: string }
>(({ businessId }) => `/v1/businesses/${businessId}/tax-estimates/profile`)

export const updateTaxProfile = patch<
  typeof TaxProfileResponseSchema.Encoded,
  TaxProfileRequest,
  { businessId: string }
>(({ businessId }) => `/v1/businesses/${businessId}/tax-estimates/profile`)

const useTaxProfileTriggerSuccess = () => {
  const { overwriteCache: overwriteTaxProfile } = useTaxProfileGlobalCacheActions()
  const { forceReload: forceReloadTaxPayments } = useTaxPaymentsGlobalCacheActions()
  const { forceReload: forceReloadTaxDetails } = useTaxDetailsGlobalCacheActions()

  return (data: typeof TaxProfileResponseSchema.Type) => {
    void overwriteTaxProfile(data)
    void forceReloadTaxPayments()
    void forceReloadTaxDetails()
  }
}

const useCreateTaxProfileMutation = createMutationHook({
  tags: [UPSERT_TAX_PROFILE_TAG_KEY],
  request: createTaxProfile,
  schema: TaxProfileResponseSchema,
  swrOptions: { throwOnError: true },
  useOnTriggerSuccess: useTaxProfileTriggerSuccess,
})

const useUpdateTaxProfileMutation = createMutationHook({
  tags: [UPSERT_TAX_PROFILE_TAG_KEY],
  request: updateTaxProfile,
  schema: TaxProfileResponseSchema,
  swrOptions: { throwOnError: true },
  useOnTriggerSuccess: useTaxProfileTriggerSuccess,
})

type UseUpsertTaxProfileProps = {
  mode: UpsertTaxProfileMode
}
export function useUpsertTaxProfile({ mode }: UseUpsertTaxProfileProps) {
  const createMutationResponse = useCreateTaxProfileMutation()
  const updateMutationResponse = useUpdateTaxProfileMutation()

  return mode === UpsertTaxProfileMode.Update
    ? updateMutationResponse
    : createMutationResponse
}
