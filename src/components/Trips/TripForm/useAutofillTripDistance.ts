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

  const isPlacePairChanged = startPlaceId !== (trip?.googleStartPlaceId ?? undefined)
    || endPlaceId !== (trip?.googleEndPlaceId ?? undefined)

  const { data: computedDistance, error } = useMileageDistance({
    startPlaceId: startPlaceId ?? '',
    endPlaceId: endPlaceId ?? '',
    isEnabled: Boolean(startPlaceId && endPlaceId) && isPlacePairChanged,
    /* A route that Google cannot compute stays uncomputable; retrying spams the Routes API. */
    swrOptions: { shouldRetryOnError: false },
  })

  useEffect(() => {
    if (computedDistance === undefined) return

    const nextDistance = toNonRecursiveBigDecimal(computedDistance)
    if (nrbdEquals(form.state.values.distance, nextDistance)) return

    form.setFieldValue('distance', nextDistance)
  }, [computedDistance, form])

  const isDistanceUncalculatable = isAPIErrorOfType(error, ApiEnumErrorType.MileageDistanceUncalculatable)

  return useMemo(() => ({ isDistanceUncalculatable }), [isDistanceUncalculatable])
}
