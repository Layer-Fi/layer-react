import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { revalidateLogic } from '@tanstack/react-form'
import { Schema } from 'effect'
import { useTranslation } from 'react-i18next'

import { type Trip, type TripForm, UpsertTripSchema } from '@schemas/trip'
import { UpsertTripMode, useUpsertTrip } from '@hooks/api/businesses/[business-id]/mileage/trips/useUpsertTrip'
import { useAppForm } from '@hooks/features/forms/useForm'
import { convertTripFormToUpsertTrip, getTripFormDefaultValues, validateTripForm } from '@components/Trips/TripForm/formUtils'

type onSuccessFn = (trip: Trip) => void
type UseTripFormProps = { onSuccess: onSuccessFn, trip?: Trip }

export const useTripForm = (props: UseTripFormProps) => {
  const { t } = useTranslation()
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
      setSubmitError(t('common:error.something_went_wrong_try_again', 'Something went wrong. Please try again.'))
    }
  }, [onSuccess, upsertTrip, t])

  const onDynamic = useCallback(({ value }: { value: TripForm }) => {
    return validateTripForm({ trip: value }, t)
  }, [t])

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

  useEffect(() => {
    form.reset(getTripFormDefaultValues(trip))
  }, [trip, form])

  return useMemo(() => ({ form, submitError }), [form, submitError])
}
