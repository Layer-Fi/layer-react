import { useCallback, useMemo, useRef } from 'react'
import { Schema } from 'effect'

import { PlaceDetailsSchema, PlaceSuggestionSchema } from '@schemas/place'
import { UnwrappedDataResponseSchema } from '@schemas/utils'
import { getWithQuery } from '@utils/api/getWithQuery'
import { useAuth } from '@hooks/utils/auth/useAuth'
import { useLayerContext } from '@contexts/LayerContext/LayerContext'

export const MIN_ADDRESS_QUERY_LENGTH = 3

const AddressSuggestionsResponseSchema = UnwrappedDataResponseSchema(Schema.Array(PlaceSuggestionSchema))
const AddressDetailsResponseSchema = UnwrappedDataResponseSchema(PlaceDetailsSchema)

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

export function useMileageAddressLookup() {
  const { data: auth } = useAuth()
  const { businessId } = useLayerContext()

  /*
   * Google bills the keystrokes and the final details call as one session,
   * so the same token is reused until a details call closes the session.
   */
  const sessionTokenRef = useRef<string | null>(null)

  const fetchAddressSuggestions = useCallback(async (inputValue: string) => {
    const query = inputValue.trim()

    if (query.length < MIN_ADDRESS_QUERY_LENGTH || !auth) {
      return []
    }

    const sessionToken = sessionTokenRef.current ??= crypto.randomUUID()

    const response = await getAddressSuggestions(auth.apiUrl, auth.access_token, {
      params: { businessId, query, sessionToken },
    })()

    return Schema.decodeUnknownPromise(AddressSuggestionsResponseSchema)(response)
  }, [auth, businessId])

  const fetchAddressDetails = useCallback(async (placeId: string) => {
    if (!auth) {
      throw new Error('Cannot fetch address details without authentication')
    }

    const sessionToken = sessionTokenRef.current ?? crypto.randomUUID()
    sessionTokenRef.current = null

    const response = await getAddressDetails(auth.apiUrl, auth.access_token, {
      params: { businessId, placeId, sessionToken },
    })()

    return Schema.decodeUnknownPromise(AddressDetailsResponseSchema)(response)
  }, [auth, businessId])

  return useMemo(() => ({
    fetchAddressSuggestions,
    fetchAddressDetails,
  }), [fetchAddressSuggestions, fetchAddressDetails])
}
