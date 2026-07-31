import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { revalidateLogic } from '@tanstack/react-form'
import { Schema } from 'effect'
import { useTranslation } from 'react-i18next'

import { type Trip, type TripForm, UpsertTripSchema } from '@schemas/trip'
import { useUpsertTrip } from '@api/businesses/[business-id]/mileage/trips/upsert'
import { useAppForm } from '@hooks/features/forms/useForm'
import { UpsertMode } from '@hooks/utils/swr/createUpsertHook'
import { convertTripFormToUpsertTrip, getTripFormDefaultValues, validateTripForm } from '@features/mileage/trips/TripForm/formUtils'
import { useAutofillTripDistance } from '@features/mileage/trips/TripForm/useAutofillTripDistance'

type onSuccessFn = (trip: Trip) => void
type UseTripFormProps = { onSuccess: onSuccessFn, trip?: Trip }

export const useTripForm = (props: UseTripFormProps) => {
  const { t } = useTranslation()
  const [submitError, setSubmitError] = useState<string | undefined>(undefined)
  const { onSuccess, trip } = props

  const { trigger: upsertTrip } = useUpsertTrip(
    trip
      ? { mode: UpsertMode.Update, tripId: trip.id }
      : { mode: UpsertMode.Create },
  )

  const defaultValuesRef = useRef<TripForm>(getTripFormDefaultValues(trip))
  const defaultValues = defaultValuesRef.current

  const onSubmit = useCallback(async ({ value }: { value: TripForm }) => {
    try {
      const tripParams = convertTripFormToUpsertTrip(value)
      const upsertTripRequest = Schema.encodeUnknownSync(UpsertTripSchema)(tripParams)
      const result = await upsertTrip(upsertTripRequest)

      setSubmitError(undefined)
      onSuccess(result)
    }
    catch (e) {
      console.error(e)
      setSubmitError(t('common:error.something_went_wrong_please_try_again', 'Something went wrong. Please try again.'))
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

  const { isDistanceIncalculable, notifyAddressChange } = useAutofillTripDistance({ form })

  return useMemo(
    () => ({ form, submitError, isDistanceIncalculable, notifyAddressChange }),
    [form, submitError, isDistanceIncalculable, notifyAddressChange],
  )
}
