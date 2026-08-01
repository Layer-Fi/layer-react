import { PlaceDetailsSchema } from '@schemas/place'
import { UnwrappedDataResponseSchema } from '@schemas/utils'
import { getWithQuery } from '@utils/api/getWithQuery'
import { createQueryHook } from '@hooks/utils/swr/createQueryHook'

export const ADDRESS_DETAILS_TAG_KEY = '#mileage-address-details'

const AddressDetailsResponseSchema = UnwrappedDataResponseSchema(PlaceDetailsSchema)

type AddressDetailsParams = {
  businessId: string
  placeId: string
  sessionToken: string
}

const getAddressDetails = getWithQuery<
  typeof AddressDetailsResponseSchema.Encoded,
  AddressDetailsParams
>(
  ['businessId'],
  ({ businessId }) => `/v1/businesses/${businessId}/mileage/address-details`,
  ({ placeId, sessionToken }) => ({
    place_id: placeId,
    session_token: sessionToken,
  }),
)

export const useMileageAddressDetails = createQueryHook({
  tags: [ADDRESS_DETAILS_TAG_KEY],
  request: getAddressDetails,
  schema: AddressDetailsResponseSchema,
})
