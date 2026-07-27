import { useEffect, useMemo } from 'react'
import { useStore } from '@tanstack/react-form'

import { nrbdEquals, toNonRecursiveBigDecimal } from '@schemas/nonRecursiveBigDecimal'
import type { Trip, TripForm } from '@schemas/trip'
import { ApiEnumErrorType, isAPIErrorOfType } from '@utils/api/apiError'
import { useMileageDistance } from '@hooks/api/businesses/[business-id]/mileage/distance/useMileageDistance'
import type { AppForm } from '@hooks/features/forms/useForm'

type UseAutofillTripDistanceProps = {
  form: AppForm<TripForm>
  trip?: Trip
}

export function useAutofillTripDistance({ form, trip }: UseAutofillTripDistanceProps) {
  const startPlaceId = useStore(form.store, state => state.values.start.place?.placeId)
  const endPlaceId = useStore(form.store, state => state.values.end.place?.placeId)

  /* A distance the user has ever edited is theirs; autofill must not overwrite it */
  const isDistanceDirty = useStore(form.store, state => state.fieldMeta.distance?.isDirty ?? false)

  const distance = useStore(form.store, state => state.values.distance)

  /* An emptied field is unclaimed again, so autofill may take it back over */
  const isDistanceEmpty = distance === null

  const isPlacePairChanged = startPlaceId !== (trip?.googleStartPlaceId ?? undefined)
    || endPlaceId !== (trip?.googleEndPlaceId ?? undefined)

  const { data: computedDistance, error } = useMileageDistance({
    startPlaceId: startPlaceId ?? '',
    endPlaceId: endPlaceId ?? '',
    isEnabled: Boolean(startPlaceId && endPlaceId)
      && (isDistanceEmpty || (isPlacePairChanged && !isDistanceDirty)),
    /* A route that Google cannot compute stays uncomputable; retrying spams the Routes API. */
    swrOptions: { shouldRetryOnError: false },
  })

  useEffect(() => {
    if (computedDistance === undefined) return

    const nextDistance = toNonRecursiveBigDecimal(computedDistance)
    if (distance !== null && nrbdEquals(distance, nextDistance)) return

    /*
     * An autofilled value is never the user's, so the field must not read as
     * dirty afterwards.
     */
    form.setFieldValue('distance', nextDistance, { dontUpdateMeta: true })
    form.setFieldMeta('distance', prev => ({ ...prev, isDirty: false }))
  }, [computedDistance, distance, form])

  const isDistanceIncalculable = isAPIErrorOfType(error, ApiEnumErrorType.MileageDistanceIncalculable)

  return useMemo(() => ({ isDistanceIncalculable }), [isDistanceIncalculable])
}
