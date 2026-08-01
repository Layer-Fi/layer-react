import { usePatchTaxProfile } from '@api/businesses/[business-id]/tax-estimates/profile/patch'
import { usePostTaxProfile } from '@api/businesses/[business-id]/tax-estimates/profile/post'

export enum UpsertTaxProfileMode {
  Create = 'Create',
  Update = 'Update',
}

type UseUpsertTaxProfileProps = {
  mode: UpsertTaxProfileMode
}

export function useUpsertTaxProfile({ mode }: UseUpsertTaxProfileProps) {
  const createMutationResponse = usePostTaxProfile()
  const updateMutationResponse = usePatchTaxProfile()

  return mode === UpsertTaxProfileMode.Update
    ? updateMutationResponse
    : createMutationResponse
}
