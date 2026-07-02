import { useCallback } from 'react'
import { Schema } from 'effect'
import useSWRMutation from 'swr/mutation'

import { type TaxProfileRequest, type TaxProfileResponse, TaxProfileResponseSchema } from '@schemas/taxEstimates/profile'
import { patch, post } from '@utils/api/authenticatedHttp'
import { createBuildKey } from '@utils/swr/createBuildKey'
import { SWRMutationResult } from '@utils/swr/SWRResponseTypes'
import { withStableTrigger } from '@utils/swr/withStableTrigger'
import { useTaxDetailsGlobalCacheActions } from '@hooks/api/businesses/[business-id]/tax-estimates/details/useTaxDetails'
import { useTaxPaymentsGlobalCacheActions } from '@hooks/api/businesses/[business-id]/tax-estimates/payments/useTaxPayments'
import { useTaxProfileGlobalCacheActions } from '@hooks/api/businesses/[business-id]/tax-estimates/profile/useTaxProfile'
import { useBuildKeyInputs } from '@hooks/utils/swr/useBuildKeyInputs'

const UPSERT_TAX_PROFILE_TAG_KEY = '#upsert-tax-profile'

export enum UpsertTaxProfileMode {
  Create = 'Create',
  Update = 'Update',
}

export const createTaxProfile = post<
  TaxProfileResponse,
  TaxProfileRequest,
  { businessId: string }
>(({ businessId }) => `/v1/businesses/${businessId}/tax-estimates/profile`)

export const updateTaxProfile = patch<
  TaxProfileResponse,
  TaxProfileRequest,
  { businessId: string }
>(({ businessId }) => `/v1/businesses/${businessId}/tax-estimates/profile`)

const buildKey = createBuildKey<{ businessId: string }>([UPSERT_TAX_PROFILE_TAG_KEY])

function getRequestFn(mode: UpsertTaxProfileMode) {
  return mode === UpsertTaxProfileMode.Update ? updateTaxProfile : createTaxProfile
}

type UseUpsertTaxProfileProps = {
  mode: UpsertTaxProfileMode
}
export function useUpsertTaxProfile({ mode }: UseUpsertTaxProfileProps) {
  const { withLocale, businessId, auth } = useBuildKeyInputs()
  const { overwriteCache: overwriteTaxProfile } = useTaxProfileGlobalCacheActions()
  const { forceReload: forceReloadTaxPayments } = useTaxPaymentsGlobalCacheActions()
  const { forceReload: forceReloadTaxDetails } = useTaxDetailsGlobalCacheActions()

  const rawMutationResponse = useSWRMutation(
    () => withLocale(buildKey({
      ...auth,
      businessId,
    })),
    async ({ accessToken, apiUrl, businessId }, { arg }: { arg: TaxProfileRequest }) => {
      const request = getRequestFn(mode)

      return request(apiUrl, accessToken, {
        params: { businessId },
        body: arg,
      }).then(Schema.decodeUnknownPromise(TaxProfileResponseSchema))
    },
    {
      revalidate: false,
      throwOnError: true,
    },
  )

  const mutationResponse = new SWRMutationResult(rawMutationResponse)

  const originalTrigger = mutationResponse.trigger

  const stableProxiedTrigger = useCallback(
    async (...triggerParameters: Parameters<typeof originalTrigger>) => {
      const triggerResult = await originalTrigger(...triggerParameters)

      void overwriteTaxProfile(triggerResult.data)
      void forceReloadTaxPayments()
      void forceReloadTaxDetails()

      return triggerResult
    },
    [forceReloadTaxDetails, forceReloadTaxPayments, originalTrigger, overwriteTaxProfile],
  )

  return withStableTrigger(mutationResponse, stableProxiedTrigger)
}
