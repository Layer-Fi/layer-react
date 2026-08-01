import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useStore } from '@tanstack/react-form'

import { toNonRecursiveBigDecimal } from '@schemas/nonRecursiveBigDecimal'
import type { TripForm } from '@schemas/trip'
import { ApiEnumErrorType, isAPIErrorOfType } from '@utils/api/apiError'
import { useGetMileageDistance } from '@api/businesses/[business-id]/mileage/distance/get'
import type { AppForm } from '@hooks/features/forms/useForm'

type UseAutofillTripDistanceProps = {
  form: AppForm<TripForm>
}

export function useAutofillTripDistance({ form }: UseAutofillTripDistanceProps) {
  const startPlaceId = useStore(form.store, state => state.values.start.place?.placeId)
  const endPlaceId = useStore(form.store, state => state.values.end.place?.placeId)

  const isDistanceEmpty = useStore(form.store, state => state.values.distance === null)
  const isDistanceDirty = useStore(form.store, state => state.fieldMeta.distance?.isDirty ?? false)

  const [hasChangedAddress, setHasChangedAddress] = useState(false)
  /* Mirrors hasChangedAddress so effects in one commit see each other's writes */
  const hasChangedAddressRef = useRef(false)

  const applyHasChangedAddress = useCallback((next: boolean) => {
    hasChangedAddressRef.current = next
    setHasChangedAddress(next)
  }, [])

  const notifyAddressChange = useCallback(() => {
    applyHasChangedAddress(true)
  }, [applyHasChangedAddress])

  /*
   * Clearing the distance cancels any not-yet-applied address change, so the
   * field refills only after the next selection. Only the moment of clearing
   * cancels — selections made while the field sits empty must stay armed.
   */
  const wasDistanceEmptyRef = useRef(isDistanceEmpty)

  useEffect(() => {
    const wasDistanceEmpty = wasDistanceEmptyRef.current
    wasDistanceEmptyRef.current = isDistanceEmpty

    if (isDistanceEmpty && !wasDistanceEmpty) {
      applyHasChangedAddress(false)
    }
  }, [isDistanceEmpty, applyHasChangedAddress])

  const { data: computedDistance, error } = useGetMileageDistance({
    startPlaceId: startPlaceId ?? '',
    endPlaceId: endPlaceId ?? '',
    isEnabled: Boolean(startPlaceId && endPlaceId)
      && hasChangedAddress
      && (isDistanceEmpty || !isDistanceDirty),
    /* A route that Google cannot compute stays uncomputable; retrying spams the Routes API. */
    swrOptions: { shouldRetryOnError: false },
  })

  useEffect(() => {
    /* The ref, not state: a clear landing in this same commit must veto the write */
    if (computedDistance === undefined || !hasChangedAddressRef.current) return

    form.setFieldValue('distance', toNonRecursiveBigDecimal(computedDistance), { dontUpdateMeta: true })
    form.setFieldMeta('distance', prev => ({ ...prev, isDirty: false }))
    applyHasChangedAddress(false)
  }, [computedDistance, form, applyHasChangedAddress])

  const isDistanceIncalculable = isAPIErrorOfType(error, ApiEnumErrorType.MileageDistanceIncalculable)

  return useMemo(
    () => ({ isDistanceIncalculable, notifyAddressChange }),
    [isDistanceIncalculable, notifyAddressChange],
  )
}
