import { UnwrappedDataResponseSchema } from '@schemas/common/utils'
import { PlaceDetailsSchema } from '@schemas/mileage/place'
import { getWithQuery } from '@utils/shared/api/getWithQuery'
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

export const useGetMileageAddressDetails = createQueryHook({
  tags: [ADDRESS_DETAILS_TAG_KEY],
  request: getAddressDetails,
  schema: AddressDetailsResponseSchema,
})
