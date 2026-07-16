import { Schema } from 'effect'

import { type TaxProfile, TaxProfileRequestSchema, TaxProfileSchema } from '@schemas/taxEstimates/profile'

import { getTaxProfile, saveTaxProfile } from '@msw/api/businesses/[business-id]/tax-estimates/profile/store'
import { apiData } from '@msw/utils/apiResponse'
import { readRequestJson } from '@msw/utils/request'

const decodeTaxProfileRequest = Schema.decodeUnknownSync(TaxProfileRequestSchema)
const encodeTaxProfile = Schema.encodeSync(TaxProfileSchema)

export const upsertTaxProfileResolver = async (
  { override, request }: { override?: TaxProfile, request: Request },
) => {
  if (override) return apiData(encodeTaxProfile(override))

  const { taxCountryCode, usConfiguration } = decodeTaxProfileRequest(await readRequestJson(request))

  const profile: TaxProfile = {
    ...getTaxProfile(),
    taxCountryCode,
    usConfiguration,
    userHasSavedTaxProfile: true,
  }
  saveTaxProfile(profile)

  return apiData(encodeTaxProfile(profile))
}
