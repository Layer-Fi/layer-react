import { Schema } from 'effect'

import { UnwrappedDataResponseSchema } from '@schemas/common/utils'
import { PlaceSuggestionSchema } from '@schemas/features/mileage/place'
import { getWithQuery } from '@utils/shared/api/getWithQuery'
import { createQueryHook } from '@hooks/utils/swr/createQueryHook'

export const MIN_ADDRESS_QUERY_LENGTH = 3

export const ADDRESS_SUGGESTIONS_TAG_KEY = '#mileage-address-suggestions'

const AddressSuggestionsResponseSchema = UnwrappedDataResponseSchema(Schema.Array(PlaceSuggestionSchema))

type AddressSuggestionsParams = {
  businessId: string
  query: string
  sessionToken: string
}

const getAddressSuggestions = getWithQuery<
  typeof AddressSuggestionsResponseSchema.Encoded,
  AddressSuggestionsParams
>(
  ['businessId'],
  ({ businessId }) => `/v1/businesses/${businessId}/mileage/address-suggestions`,
  ({ query, sessionToken }) => ({
    query,
    session_token: sessionToken,
  }),
)

export const useGetMileageAddressSuggestions = createQueryHook({
  tags: [ADDRESS_SUGGESTIONS_TAG_KEY],
  request: getAddressSuggestions,
  schema: AddressSuggestionsResponseSchema,
  swrOptions: { keepPreviousData: true },
})
