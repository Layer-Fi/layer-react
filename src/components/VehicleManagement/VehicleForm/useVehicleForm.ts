import { useCallback, useMemo, useState, useRef } from 'react'
import { revalidateLogic } from '@tanstack/react-form'
import { useAppForm } from '@features/forms/hooks/useForm'
import { UpsertVehicleSchema, type Vehicle, type VehicleForm } from '@schemas/vehicle'
import { getVehicleFormDefaultValues, validateVehicleForm, convertVehicleFormToUpsertVehicle } from '@components/VehicleManagement/VehicleForm/formUtils'
import { useUpsertVehicle, UpsertVehicleMode } from '@features/vehicles/api/useUpsertVehicle'
import { Schema } from 'effect'

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

  return useMemo(() => (
    { form, submitError }),
  [form, submitError])
}
