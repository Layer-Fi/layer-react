import { useCallback, useMemo, useState, useRef } from 'react'
import { revalidateLogic } from '@tanstack/react-form'
import { useAppForm } from '@features/forms/hooks/useForm'
import { type TripEncoded } from '@schemas/trip'
import { type TripForm, getTripFormDefaultValues, validateTripForm, convertTripFormToParams } from '@components/Trips/TripForm/formUtils'
import { useUpsertTrip, UpsertTripMode } from '@features/trips/api/useUpsertTrip'

type onSuccessFn = (trip: TripEncoded) => void
type UseTripFormProps = { onSuccess: onSuccessFn, trip?: TripEncoded }

export const useTripForm = (props: UseTripFormProps) => {
  const [submitError, setSubmitError] = useState<string | undefined>(undefined)
  const { onSuccess, trip } = props

  const upsertTrip = useUpsertTrip(
    trip
      ? { mode: UpsertTripMode.Update, tripId: trip.id }
      : { mode: UpsertTripMode.Create },
  )

  const defaultValuesRef = useRef<TripForm>(getTripFormDefaultValues(trip))
  const defaultValues = defaultValuesRef.current

  const onSubmit = useCallback(async ({ value }: { value: TripForm }) => {
    try {
      const tripParams = convertTripFormToParams(value)
      const result = await upsertTrip.trigger(tripParams)

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
