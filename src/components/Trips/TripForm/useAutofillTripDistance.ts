import { useEffect } from 'react'
import { useStore } from '@tanstack/react-form'

import { nrbdEquals, toNonRecursiveBigDecimal } from '@schemas/nonRecursiveBigDecimal'
import type { Trip, TripForm } from '@schemas/trip'
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

  const { data: computedDistance } = useMileageDistance({
    startPlaceId: startPlaceId ?? '',
    endPlaceId: endPlaceId ?? '',
    isEnabled: Boolean(startPlaceId && endPlaceId) && isPlacePairChanged,
  })

  useEffect(() => {
    if (computedDistance === undefined) return

    const nextDistance = toNonRecursiveBigDecimal(computedDistance)
    if (nrbdEquals(form.state.values.distance, nextDistance)) return

    form.setFieldValue('distance', nextDistance)
  }, [computedDistance, form])
}
