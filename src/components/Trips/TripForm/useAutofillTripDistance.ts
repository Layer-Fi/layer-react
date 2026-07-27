import { useEffect, useMemo, useRef } from 'react'
import { useStore } from '@tanstack/react-form'

import { toNonRecursiveBigDecimal } from '@schemas/nonRecursiveBigDecimal'
import type { Trip, TripForm } from '@schemas/trip'
import { ApiEnumErrorType, isAPIErrorOfType } from '@utils/api/apiError'
import { useMileageDistance } from '@hooks/api/businesses/[business-id]/mileage/distance/useMileageDistance'
import type { AppForm } from '@hooks/features/forms/useForm'

type UseAutofillTripDistanceProps = {
  form: AppForm<TripForm>
  trip?: Trip
}

const placePairKey = (startPlaceId?: string | null, endPlaceId?: string | null) =>
  `${startPlaceId ?? ''}|${endPlaceId ?? ''}`

export function useAutofillTripDistance({ form, trip }: UseAutofillTripDistanceProps) {
  const startPlaceId = useStore(form.store, state => state.values.start.place?.placeId)
  const endPlaceId = useStore(form.store, state => state.values.end.place?.placeId)

  /* A distance the user has ever edited is theirs; autofill must not overwrite it */
  const isDistanceDirty = useStore(form.store, state => state.fieldMeta.distance?.isDirty ?? false)

  /* An emptied field is unclaimed again, so autofill may take it back over */
  const isDistanceEmpty = useStore(form.store, state => state.values.distance === null)

  /*
   * The pair the distance in the field already answers for — a saved trip's own
   * distance counts. Without it, emptying the field would re-enable the query
   * and SWR's cached route would snap straight back in.
   */
  const answeredPairRef = useRef(placePairKey(trip?.googleStartPlaceId, trip?.googleEndPlaceId))

  useEffect(() => {
    answeredPairRef.current = placePairKey(trip?.googleStartPlaceId, trip?.googleEndPlaceId)
  }, [trip])

  const { data: computedDistance, error } = useMileageDistance({
    startPlaceId: startPlaceId ?? '',
    endPlaceId: endPlaceId ?? '',
    isEnabled: Boolean(startPlaceId && endPlaceId)
      && answeredPairRef.current !== placePairKey(startPlaceId, endPlaceId)
      && (isDistanceEmpty || !isDistanceDirty),
    /* A route that Google cannot compute stays uncomputable; retrying spams the Routes API. */
    swrOptions: { shouldRetryOnError: false },
  })

  useEffect(() => {
    if (computedDistance === undefined) return

    /* An autofilled value is never the user's, so the field must not read as dirty */
    form.setFieldValue('distance', toNonRecursiveBigDecimal(computedDistance), { dontUpdateMeta: true })
    form.setFieldMeta('distance', prev => ({ ...prev, isDirty: false }))
    answeredPairRef.current = placePairKey(startPlaceId, endPlaceId)
  }, [computedDistance, startPlaceId, endPlaceId, form])

  const isDistanceIncalculable = isAPIErrorOfType(error, ApiEnumErrorType.MileageDistanceIncalculable)

  return useMemo(() => ({ isDistanceIncalculable }), [isDistanceIncalculable])
}
