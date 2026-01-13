import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { revalidateLogic } from '@tanstack/react-form'
import { Schema } from 'effect'

import { UpsertVehicleSchema, type Vehicle, type VehicleForm } from '@schemas/vehicle'
import { convertVehicleFormToUpsertVehicle, getVehicleFormDefaultValues, validateVehicleForm } from '@components/VehicleManagement/VehicleForm/formUtils'
import { useAppForm } from '@features/forms/hooks/useForm'
import { UpsertVehicleMode, useUpsertVehicle } from '@features/vehicles/api/useUpsertVehicle'

type onSuccessFn = (vehicle: Vehicle) => void
type UseVehicleFormProps = { onSuccess: onSuccessFn, vehicle?: Vehicle }

export const useVehicleForm = (props: UseVehicleFormProps) => {
  const [submitError, setSubmitError] = useState<string | undefined>(undefined)
  const { onSuccess, vehicle } = props

  const { trigger: upsertVehicle } = useUpsertVehicle(
    vehicle
      ? { mode: UpsertVehicleMode.Update, vehicleId: vehicle.id }
      : { mode: UpsertVehicleMode.Create },
  )

  const defaultValuesRef = useRef<VehicleForm>(getVehicleFormDefaultValues(vehicle))
  const defaultValues = defaultValuesRef.current

  const onSubmit = useCallback(async ({ value }: { value: VehicleForm }) => {
    try {
      const vehicleParams = convertVehicleFormToUpsertVehicle(value)
      const upsertVehicleRequest = Schema.encodeUnknownSync(UpsertVehicleSchema)(vehicleParams)
      const result = await upsertVehicle(upsertVehicleRequest)

      setSubmitError(undefined)
      onSuccess(result.data)
    }
    catch (e) {
      console.error(e)
      setSubmitError('Something went wrong. Please try again.')
    }
  }, [onSuccess, upsertVehicle])

  const onDynamic = useCallback(({ value }: { value: VehicleForm }) => {
    return validateVehicleForm({ vehicle: value })
  }, [])

  const validators = useMemo(() => ({ onDynamic }), [onDynamic])

  const form = useAppForm<VehicleForm>({
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
    form.reset(getVehicleFormDefaultValues(vehicle))
  }, [vehicle, form])

  return useMemo(() => ({ form, submitError }), [form, submitError])
}
