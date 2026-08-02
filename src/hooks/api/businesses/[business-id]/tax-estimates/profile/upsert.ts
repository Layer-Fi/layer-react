import { usePatchTaxProfile } from '@api/businesses/[business-id]/tax-estimates/profile/patch'
import { usePostTaxProfile } from '@api/businesses/[business-id]/tax-estimates/profile/post'
import { createUpsertHook } from '@hooks/utils/swr/createUpsertHook'

// Create and update target the same path, so neither mode needs key params.
export const useUpsertTaxProfile = createUpsertHook({
  useCreate: usePostTaxProfile,
  useUpdate: usePatchTaxProfile,
  toCreateOptions: () => undefined,
  toUpdateOptions: () => undefined,
})
