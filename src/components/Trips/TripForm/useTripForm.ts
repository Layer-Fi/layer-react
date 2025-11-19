import { useCallback, useMemo, useRef, useState } from 'react'
import { revalidateLogic } from '@tanstack/react-form'
import { Schema } from 'effect'

import { type Trip, type TripForm, UpsertTripSchema } from '@schemas/trip'
import { convertTripFormToUpsertTrip, getTripFormDefaultValues, validateTripForm } from '@components/Trips/TripForm/formUtils'
import { useAppForm } from '@features/forms/hooks/useForm'
import { UpsertTripMode, useUpsertTrip } from '@features/trips/api/useUpsertTrip'

type onSuccessFn = (trip: Trip) => void
type UseTripFormProps = { onSuccess: onSuccessFn, trip?: Trip }

export const useTripForm = (props: UseTripFormProps) => {
  const [submitError, setSubmitError] = useState<string | undefined>(undefined)
  const { onSuccess, trip } = props

  const { trigger: upsertTrip } = useUpsertTrip(
    trip
      ? { mode: UpsertTripMode.Update, tripId: trip.id }
      : { mode: UpsertTripMode.Create },
  )

  const defaultValuesRef = useRef<TripForm>(getTripFormDefaultValues(trip))
  const defaultValues = defaultValuesRef.current

  const onSubmit = useCallback(async ({ value }: { value: TripForm }) => {
    try {
      const tripParams = convertTripFormToUpsertTrip(value)
      const upsertTripRequest = Schema.encodeUnknownSync(UpsertTripSchema)(tripParams)
      const result = await upsertTrip(upsertTripRequest)

      setSubmitError(undefined)
      onSuccess(result.data)
    }
    catch (e) {
      console.error(e)
      setSubmitError('Something went wrong. Please try again.')
    }
  }, [onSuccess, upsertTrip])

  const onDynamic = useCallback(({ value }: { value: TripForm }) => {
    return validateTripForm({ trip: value })
  }, [])

  const validators = useMemo(() => ({ onDynamic }), [onDynamic])

  const form = useAppForm<TripForm>({
    defaultValues,
    onSubmit,
    validators,
    validationLogic: revalidateLogic({
      mode: 'submit',
      modeAfterSubmission: 'submit',
    }),
    canSubmitWhenInvalid: true,
  })

  return useMemo(() => (
    { form, submitError }),
  [form, submitError])
}
